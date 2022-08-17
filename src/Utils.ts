import UniversalProfile from "@lukso/lsp-smart-contracts/artifacts/UniversalProfile.json";
import KeyManager from "@lukso/lsp-smart-contracts/artifacts/LSP6KeyManager.json";
import Web3 from "web3";
import dotenv from 'dotenv'

dotenv.config()

export default class Utils {
    private web3: Web3;

    constructor(web3: Web3) {
        this.web3 = web3;
    }

    public async execute(payload: string, from: string, account: string) {
        const keyManager = await this.getKeyManager(account);
        await keyManager.methods.execute(payload).send({
            from,
            gasLimit: process.env.GAS_LIMIT,
        });
    }

    public async encodePayload(account: string, params: any) {
        const up = await this.getAccount(account);
        let { operation, to, value, data } = params;
        return await up.methods.execute(operation, to, value, data).encodeABI();
    }

    public async getKeyManager(account: string) {
        const myUniversalProfile = new this.web3.eth.Contract(UniversalProfile.abi as any, account);
        const keyManagerAddress = await myUniversalProfile.methods.owner().call();
        return new this.web3.eth.Contract(KeyManager.abi as any, keyManagerAddress);
    }

    public async getAccount(account: string) {
        return new this.web3.eth.Contract(UniversalProfile.abi as any, account);
    }
}
