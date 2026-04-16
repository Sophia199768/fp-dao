import { Address, TonClient, WalletContractV4, internal, toNano } from "@ton/ton";
import { mnemonicToPrivateKey } from "@ton/crypto";
import { beginCell } from "@ton/core";
import { storeBurnAndBridgeBack } from "../wrappers/FpDao";
import "dotenv/config";

function requiredEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing env ${name}`);
    }
    return value;
}

function parseAmountUint32(input: string): bigint {
    const amount = BigInt(input);
    if (amount <= 0n) {
        throw new Error("Amount must be > 0");
    }
    if (amount > 0xffffffffn) {
        throw new Error("Amount must fit uint32 (<= 4294967295)");
    }
    return amount;
}

async function main() {
    const stacksAddress = process.argv[2];
    const amountInput = process.argv[3];

    if (!stacksAddress || !amountInput) {
        console.log("Usage: ts-node --transpile-only scripts/bridgeToStacks.ts <STACKS_ADDRESS> <AMOUNT>");
        process.exit(1);
    }

    const amount = parseAmountUint32(amountInput);
    const tonRpc = process.env.TON_RPC_URL ?? "https://testnet.toncenter.com/api/v2/jsonRPC";
    const tonApiKey = process.env.TONCENTER_API_KEY;
    const daoAddress = Address.parse(requiredEnv("TON_DAO_ADDRESS"));
    const mnemonic = process.env.TON_BRIDGE_USER_MNEMONIC ?? requiredEnv("TON_ORACLE_MNEMONIC");
    const transferValue = process.env.TON_BRIDGE_SEND_VALUE ?? "0.06";

    const keyPair = await mnemonicToPrivateKey(mnemonic.split(/\s+/).filter(Boolean));
    const wallet = WalletContractV4.create({
        workchain: 0,
        publicKey: keyPair.publicKey,
    });

    const client = new TonClient({
        endpoint: tonRpc,
        apiKey: tonApiKey || undefined,
    });

    const openedWallet = client.open(wallet);
    const seqno = await openedWallet.getSeqno();

    const body = beginCell()
        .store(
            storeBurnAndBridgeBack({
                $$type: "BurnAndBridgeBack",
                amount,
                stacksAddress,
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

    console.log("Bridge tx sent");
    console.log("From wallet:", wallet.address.toString({ bounceable: true, testOnly: true }));
    console.log("DAO:", daoAddress.toString({ bounceable: true, testOnly: true }));
    console.log("Stacks recipient:", stacksAddress);
    console.log("Amount:", amount.toString());
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
