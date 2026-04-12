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
        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
        if (process.env[k] === undefined) process.env[k] = v;
    }
}

function env(name: string, fallback?: string): string {
    const v = process.env[name] ?? fallback;
    if (v === undefined || v === "") throw new Error(`Missing env ${name}`);
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
        if (j.tx_status === "abort_by_response" || j.tx_status === "abort_by_post_condition")
            throw new Error(`Stacks tx ${txId} failed: ${j.tx_status}`);
        await sleep(2000);
    }
    throw new Error(`Timeout waiting Stacks tx ${txId}`);
}

function tryParseBridgeOut(body: Cell | null): { amount: bigint; stacksAddress: string } | null {
    if (!body) return null;
    const s = body.beginParse();
    if (s.remainingBits < 32) return null;
    if (s.preloadUint(32) !== 273) return null;
    try {
        const ev = loadBridgeOutEvent(s);
        return { amount: ev.amount, stacksAddress: ev.stacksAddress };
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

    const tonClient = new TonClient({ endpoint: tonRpc, apiKey: tonApiKey || undefined });
    const keyPair = await mnemonicToPrivateKey(mnemonic.split(/\s+/).filter(Boolean));
    const wallet = WalletContractV4.create({ workchain: 0, publicKey: keyPair.publicKey });
    const opened = tonClient.open(wallet);

    const contractFullId = `${stacksAddr}.${stacksName}`;
    const statePath = path.resolve(process.env.ORACLE_STATE_PATH ?? path.join(process.cwd(), ".oracle-state.json"));
    const processed = loadProcessedIds(statePath);

    console.log("Oracle TON wallet:", wallet.address.toString());
    console.log("Monitoring TON DAO:", daoAddress.toString());
    console.log("Stacks bridge contract:", contractFullId);

    setInterval(async () => {
        try {
            const txs = await tonClient.getTransactions(daoAddress, { limit: 20 });
            for (const tx of txs) {
                const h = tx.hash().toString("hex");
                const key = `ton:${h}`;
                if (processed.has(key)) continue;

                let bridge: { amount: bigint; stacksAddress: string } | null = null;
                for (const outMsg of tx.outMessages.values()) {
                    bridge = tryParseBridgeOut(outMsg.body);
                    if (bridge) break;
                }
                if (!bridge) {
                    processed.add(key);
                    saveProcessedIds(statePath, processed);
                    continue;
                }

                console.log(`[TON->Stacks] BridgeOut amount=${bridge.amount} stacksRecipient=${bridge.stacksAddress}`);
                await sleep(tonConfirmMs);

                const txOpts = {
                    contractAddress: stacksAddr,
                    contractName: stacksName,
                    functionName: "unlock-from-ton",
                    functionArgs: [uintCV(bridge.amount), principalCV(bridge.stacksAddress)],
                    senderKey: stacksKey,
                    validateWithPostConditions: false,
                    network: stacksNetwork,
                    anchorMode: AnchorMode.Any,
                    postConditionMode: PostConditionMode.Allow,
                };
                const stxTx = await makeContractCall(txOpts);
                const sent = await broadcastTransaction({ transaction: stxTx, network: stacksNetwork });
                if ("error" in sent && sent.error) {
                    console.error("[TON->Stacks] broadcast:", sent.error);
                    continue;
                }
                console.log("[TON->Stacks] unlock-from-ton tx:", (sent as { txid: string }).txid);

                processed.add(key);
                saveProcessedIds(statePath, processed);
            }
        } catch (e) {
            console.error("TON poll error:", e);
        }
    }, 12_000);

    setInterval(async () => {
        try {
            const url = `${stacksApi}/extended/v1/address/${stacksAddr}/transactions?limit=30`;
            const response = await fetch(url);
            if (!response.ok) return;
            const data = (await response.json()) as {
                results?: { tx_id: string; tx: Record<string, unknown> }[];
            };
            for (const row of data.results ?? []) {
                const txId = row.tx_id;
                const key = `stacks:${txId}`;
                if (processed.has(key)) continue;

                const tx = row.tx as {
                    tx_type?: string;
                    contract_call?: {
                        contract_id?: string;
                        function_name?: string;
                        function_args?: { repr?: string }[];
                    };
                };
                const cc = tx.contract_call;
                const isCall = tx.tx_type === "contract_call" || tx.tx_type === "smart_contract";
                if (!isCall || !cc) continue;
                if (cc.contract_id !== contractFullId) continue;
                if (cc.function_name !== "lock") continue;

                const args = cc.function_args ?? [];
                if (args.length < 2) continue;

                const lockAmount = parseStacksUIntRepr(args[0].repr ?? "0");
                const tonRecipient = parseStacksStringRepr(args[1].repr ?? "");

                console.log(`[Stacks->TON] lock tx=${txId} amount=${lockAmount} ton=${tonRecipient}`);
                await waitStacksTxSuccess(txId, stacksApi);

                const mintAmt = toUint32(lockAmount);
                const body = beginCell()
                    .store(
                        storeMintVotingPower({
                            $$type: "MintVotingPower",
                            user: Address.parse(tonRecipient),
                            amount: BigInt(mintAmt),
                        })
                    )
                    .endCell();

                await opened.sendTransfer({
                    seqno: await opened.getSeqno(),
                    secretKey: keyPair.secretKey,
                    messages: [
                        internal({
                            to: daoAddress,
                            value: BigInt(60_000_000),
                            bounce: true,
                            body,
                        }),
                    ],
                });
                console.log("[Stacks->TON] MintVotingPower sent for", tonRecipient);

                processed.add(key);
                saveProcessedIds(statePath, processed);
            }
        } catch (e) {
            console.error("Stacks poll error:", e);
        }
    }, 15_000);

    console.log("Oracle loops started (TON 12s, Stacks 15s).");
}

main().catch(console.error);
