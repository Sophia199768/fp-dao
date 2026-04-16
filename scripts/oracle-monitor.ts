import * as fs from "fs";
import * as path from "path";
import { TonClient, Address, WalletContractV4, internal, beginCell } from "@ton/ton";
import { mnemonicToPrivateKey } from "@ton/crypto";
import {
    makeContractCall,
    broadcastTransaction,
    AnchorMode,
    PostConditionMode,
    uintCV,
    principalCV,
} from "@stacks/transactions";
import { createNetwork } from "@stacks/network";
import type { Cell } from "@ton/core";
import { loadBridgeOutEvent, storeMintVotingPower } from "../wrappers/FpDao";

type BridgeOut = {
    id: bigint;
    amount: bigint;
    stacksAddress: string;
};

function sleep(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
}

function loadProcessedIds(file: string): Set<string> {
    try {
        const raw = fs.readFileSync(file, "utf8");
        const j = JSON.parse(raw) as { ids?: string[] };
        return new Set(j.ids ?? []);
    } catch {
        return new Set();
    }
}

function saveProcessedIds(file: string, ids: Set<string>) {
    fs.writeFileSync(file, JSON.stringify({ ids: [...ids] }, null, 2), "utf8");
}

function loadDotEnv() {
    const p = path.join(process.cwd(), ".env");
    if (!fs.existsSync(p)) return;

    for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
        const t = line.trim();
        if (!t || t.startsWith("#")) continue;

        const eq = t.indexOf("=");
        if (eq <= 0) continue;

        const k = t.slice(0, eq).trim();
        let v = t.slice(eq + 1).trim();

        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
            v = v.slice(1, -1);
        }

        if (process.env[k] === undefined) process.env[k] = v;
    }
}

function env(name: string, fallback?: string): string {
    const v = process.env[name] ?? fallback;
    if (!v) throw new Error(`Missing env ${name}`);
    return v;
}

function toUint32(n: bigint): number {
    const max = 0xffffffffn;
    return Number(n > max ? max : n);
}

function parseStacksUIntRepr(repr: string): bigint {
    const t = repr.trim();
    if (t.startsWith("u")) return BigInt(t.slice(1));
    return BigInt(t);
}

function parseStacksStringRepr(repr: string): string {
    const t = repr.trim();
    if (t.length >= 2 && t.startsWith('"') && t.endsWith('"')) return t.slice(1, -1);
    return t;
}

async function waitStacksTxSuccess(txId: string, apiBase: string): Promise<void> {
    for (let i = 0; i < 90; i++) {
        const r = await fetch(`${apiBase}/extended/v1/tx/${txId}`);
        if (!r.ok) {
            await sleep(2000);
            continue;
        }

        const j = (await r.json()) as { tx_status?: string };

        if (j.tx_status === "success") return;

        if (
            j.tx_status === "abort_by_response" ||
            j.tx_status === "abort_by_post_condition"
        ) {
            throw new Error(`Stacks tx ${txId} failed: ${j.tx_status}`);
        }

        await sleep(2000);
    }

    throw new Error(`Timeout waiting Stacks tx ${txId}`);
}

function tryParseBridgeOut(body: Cell | null): BridgeOut | null {
    if (!body) return null;

    try {
        const s = body.beginParse();

        if (s.remainingBits < 32) return null;

        if (s.preloadUint(32) !== 273) return null;

        const ev = loadBridgeOutEvent(s);

        return {
            id: ev.id,
            amount: ev.amount,
            stacksAddress: ev.stacksAddress,
        };
    } catch {
        return null;
    }
}

async function main() {
    loadDotEnv();

    const tonRpc = env("TON_RPC_URL", "https://testnet.toncenter.com/api/v2/jsonRPC");
    const tonApiKey = process.env.TONCENTER_API_KEY ?? "";

    const daoAddress = Address.parse(env("TON_DAO_ADDRESS"));
    const mnemonic = env("TON_ORACLE_MNEMONIC");

    const stacksAddr = env("STACKS_CONTRACT_ADDRESS");
    const stacksName = env("STACKS_CONTRACT_NAME", "dao-bridge");
    const stacksKey = env("STACKS_ORACLE_SECRET_KEY");

    const stacksApi = process.env.STACKS_API_URL ?? "https://api.testnet.hiro.so";

    const stacksNetwork = createNetwork({
        network: "testnet",
        client: { baseUrl: stacksApi },
    });

    const tonConfirmMs = Number(process.env.TON_CONFIRM_AFTER_MS ?? "8000");

    const tonClient = new TonClient({
        endpoint: tonRpc,
        apiKey: tonApiKey || undefined,
    });

    const keyPair = await mnemonicToPrivateKey(
        mnemonic.split(/\s+/).filter(Boolean)
    );

    const wallet = WalletContractV4.create({
        workchain: 0,
        publicKey: keyPair.publicKey,
    });

    const opened = tonClient.open(wallet);

    const contractFullId = `${stacksAddr}.${stacksName}`;

    const statePath = path.resolve(
        process.env.ORACLE_STATE_PATH ?? path.join(process.cwd(), ".oracle-state.json")
    );

    const processed = loadProcessedIds(statePath);

    console.log("Oracle TON wallet:", wallet.address.toString());
    console.log("Monitoring TON DAO:", daoAddress.toString());
    console.log("Stacks contract:", contractFullId);

    setInterval(async () => {
        try {
            const txs = await tonClient.getTransactions(daoAddress, { limit: 20 });

            for (const tx of txs) {

                // TON API: иногда out_msgs, иногда outMessages
                const outMsgs =
                    (tx as any).out_msgs ??
                    (tx as any).outMessages ??
                    [];

                if (!outMsgs || outMsgs.length === 0) continue;

                let bridge: BridgeOut | null = null;

                for (const outMsg of outMsgs) {

                    const body = outMsg?.body;
                    if (!body) continue;

                    const parsed = tryParseBridgeOut(body);

                    if (parsed) {
                        bridge = parsed;
                        break;
                    }
                }

                if (!bridge) continue;

                const key = `ton:${bridge.id.toString()}`;

                if (processed.has(key)) continue;

                console.log(
                    `[TON->Stacks] FOUND id=${bridge.id.toString()} amount=${bridge.amount.toString()} addr=${bridge.stacksAddress}`
                );

                try {
                    const stxTx = await makeContractCall({
                        contractAddress: stacksAddr,
                        contractName: stacksName,
                        functionName: "mint",
                        functionArgs: [
                            principalCV(bridge.stacksAddress),
                            uintCV(Number(bridge.amount)),
                            uintCV(Number(bridge.id)),
                        ],
                        senderKey: stacksKey,
                        network: stacksNetwork,
                        postConditionMode: PostConditionMode.Allow,
                    });

                    const sent = await broadcastTransaction({
                        transaction: stxTx,
                        network: stacksNetwork,
                    });

                    console.log("[Stacks SENT]", sent);

                    processed.add(key);
                    saveProcessedIds(statePath, processed);

                } catch (e) {
                    console.error("[Stacks ERROR]", e);
                }
            }

        } catch (e) {
            console.error("TON loop error:", e);
        }
    }, 12000);

    console.log("Oracle started");
}

main().catch(console.error);