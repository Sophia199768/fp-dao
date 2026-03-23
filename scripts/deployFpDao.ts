import { toNano, Address, WalletContractV4 } from "@ton/ton";
import { FpDao } from "../wrappers/FpDao";
import { NetworkProvider } from "@ton/blueprint";

export async function run(provider: NetworkProvider) {
    const JETTON_MASTER = Address.parse("EQBLqt1rDRbZMJ2B80UqKEspetZ5GtPhedWnUe2qAiqTpDp9");
    const VERSION = 5n;

    const dao = provider.open(
        await FpDao.fromInit(JETTON_MASTER, VERSION)
    );

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
