import * as fs from "fs";
import * as path from "path";
import { Address, TonClient, WalletContractV4, internal, toNano } from "@ton/ton";
import { mnemonicToPrivateKey } from "@ton/crypto";
import { beginCell } from "@ton/core";
import { storeMintVotingPower } from "../wrappers/FpDao";
import "dotenv/config";

type StacksTxArg = {
    name?: string;
    repr?: string;
    hex?: string;
};

type StacksTx = {
    tx_id?: string;
    tx_status?: string;
    tx_type?: string;
    contract_call?: {
        function_name?: string;
        function_args?: StacksTxArg[];
    };
};

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function env(name: string, fallback?: string): string {
    const value = process.env[name] ?? fallback;
    if (!value) {
        throw new Error(`Missing env ${name}`);
    }
    return value;
}

function loadProcessedIds(file: string): Set<string> {
    try {
        const raw = fs.readFileSync(file, "utf8");
        const parsed = JSON.parse(raw) as { ids?: string[] };
        return new Set(parsed.ids ?? []);
    } catch {
        return new Set();
    }
}

function saveProcessedIds(file: string, ids: Set<string>) {
    fs.writeFileSync(file, JSON.stringify({ ids: [...ids] }, null, 2), "utf8");
}

function parseStacksString(repr?: string): string | null {
    if (!repr) return null;
    const text = repr.trim();
    if (text.startsWith('"') && text.endsWith('"') && text.length >= 2) {
        return text.slice(1, -1);
    }
    return text;
}

function parseStacksUint(repr?: string): bigint | null {
    if (!repr) return null;
    const text = repr.trim();
    if (text.startsWith("u")) return BigInt(text.slice(1));
    return BigInt(text);
}

function toUint32(value: bigint): bigint {
    const max = 0xffffffffn;
    if (value < 0n) return 0n;
    if (value > max) return max;
    return value;
}

function extractLockCall(tx: StacksTx): { tonRecipient: string; amount: bigint; eventId: bigint } | null {
    if (tx.tx_status !== "success") return null;
    if (tx.tx_type !== "contract_call") return null;
    if (tx.contract_call?.function_name !== "lock") return null;

    const args = tx.contract_call.function_args ?? [];
    const amountArg = args.find((arg) => arg.name === "amount");
    const recipientArg = args.find((arg) => arg.name === "ton-recipient");
    const eventIdArg = args.find((arg) => arg.name === "event-id");

    const amount = parseStacksUint(amountArg?.repr);
    const tonRecipient = parseStacksString(recipientArg?.repr);
    const eventId = parseStacksUint(eventIdArg?.repr);

    if (amount === null || !tonRecipient || eventId === null) return null;

    return { tonRecipient, amount, eventId };
}

async function main() {
    const tonRpc = env("TON_RPC_URL", "https://testnet.toncenter.com/api/v2/jsonRPC");
    const tonApiKey = process.env.TONCENTER_API_KEY;
    const daoAddress = Address.parse(env("TON_DAO_ADDRESS"));
    const mnemonic = env("TON_ORACLE_MNEMONIC");
    const transferValue = process.env.TON_ORACLE_SEND_VALUE ?? "0.06";

    const stacksApi = env("STACKS_API_URL", "https://api.testnet.hiro.so");
    const stacksAddr = env("STACKS_CONTRACT_ADDRESS");
    const stacksName = env("STACKS_CONTRACT_NAME", "wrapped-vote-token");
    const contractId = `${stacksAddr}.${stacksName}`;

    const pollMs = Number(process.env.STACKS_POLL_MS ?? "10000");
    const statePath = path.resolve(
        process.env.STACKS_ORACLE_STATE_PATH ?? path.join(process.cwd(), ".stacks-oracle-state.json")
    );
    const processed = loadProcessedIds(statePath);

    const keyPair = await mnemonicToPrivateKey(mnemonic.split(/\s+/).filter(Boolean));
    const wallet = WalletContractV4.create({
        workchain: 0,
        publicKey: keyPair.publicKey,
    });

    const tonClient = new TonClient({
        endpoint: tonRpc,
        apiKey: tonApiKey || undefined,
    });

    const openedWallet = tonClient.open(wallet);

    console.log("Stacks->TON watcher started");
    console.log("Stacks contract:", contractId);
    console.log("TON dao:", daoAddress.toString());
    console.log("TON oracle wallet:", wallet.address.toString());

    while (true) {
        try {
            const url = `${stacksApi}/extended/v1/address/${contractId}/transactions?limit=30`;
            const response = await fetch(url);
            if (!response.ok) {
                console.error("Stacks API error:", response.status, response.statusText);
                await sleep(pollMs);
                continue;
            }

            const payload = (await response.json()) as { results?: StacksTx[] };
            const results = payload.results ?? [];

            for (const tx of results) {
                const lockData = extractLockCall(tx);
                if (!lockData) continue;

                const key = `stacks:${lockData.eventId.toString()}`;
                if (processed.has(key)) continue;

                let recipient: Address;
                try {
                    recipient = Address.parse(lockData.tonRecipient);
                } catch {
                    console.error("Skip invalid TON recipient:", lockData.tonRecipient);
                    processed.add(key);
                    saveProcessedIds(statePath, processed);
                    continue;
                }

                const amountUint32 = toUint32(lockData.amount);
                const seqno = await openedWallet.getSeqno();

                const body = beginCell()
                    .store(
                        storeMintVotingPower({
                            $$type: "MintVotingPower",
                            user: recipient,
                            amount: amountUint32,
                        })
                    )
                    .endCell();

                await openedWallet.sendTransfer({
                    secretKey: keyPair.secretKey,
                    seqno,
                    messages: [
                        internal({
                            to: daoAddress,
                            value: toNano(transferValue),
                            body,
                        }),
                    ],
                });

                processed.add(key);
                saveProcessedIds(statePath, processed);

                console.log(
                    `[Stacks->TON] tx=${tx.tx_id ?? "unknown"} event=${lockData.eventId.toString()} amount=${amountUint32.toString()} recipient=${recipient.toString()}`
                );
            }
        } catch (error) {
            console.error("Watcher loop error:", error);
        }

        await sleep(pollMs);
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
