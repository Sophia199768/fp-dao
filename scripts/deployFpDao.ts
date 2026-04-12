import { toNano, Address } from "@ton/ton";
import { FpDao } from "../wrappers/FpDao";
import { NetworkProvider } from "@ton/blueprint";

export async function run(provider: NetworkProvider) {
    const JETTON_MASTER = Address.parse("EQBLqt1rDRbZMJ2B80UqKEspetZ5GtPhedWnUe2qAiqTpDp9");
    const VERSION = 6n;

    let oracle: Address;

    const fromSender = provider.sender().address;
    if (fromSender === undefined) {
        throw new Error("Set ORACLE_ADDRESS or use a sender wallet with a defined address.");
    }
    oracle = fromSender;

    const dao = provider.open(await FpDao.fromInit(JETTON_MASTER, VERSION, oracle));

    console.log("Oracle (mint authority on TON):", oracle.toString());
    console.log("Новый адрес DAO:", dao.address.toString());

    await dao.send(
        provider.sender(),
        { value: toNano("0.3") },
        { $$type: "Deploy", queryId: 0n }
    );

    await provider.waitForDeploy(dao.address);
    console.log("DAO задеплоен:", dao.address.toString());
    console.log("kQ адрес:", dao.address.toString({ bounceable: true, testOnly: true }));
}
