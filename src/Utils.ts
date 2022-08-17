import UniversalProfile from "@lukso/lsp-smart-contracts/artifacts/UniversalProfile.json";
import KeyManager from "@lukso/lsp-smart-contracts/artifacts/LSP6KeyManager.json";
import Web3 from "web3";
import dotenv from "dotenv";
import BigNumber from "bignumber.js";
dotenv.config();

export default class Utils {
  private web3: Web3;

  constructor(web3: Web3) {
    this.web3 = web3;
  }

  public async getFairGasPrice(web3: Web3): Promise<string> {
    const x = new BigNumber(await web3.eth.getGasPrice());

    return x
      .multipliedBy(0.001)
      .plus(1)
      .integerValue(BigNumber.ROUND_UP)
      .toString(10);
  }

  public async execute(payload: string, from: string, account: string) {
    const keyManager = await this.getKeyManager(account);
    let estGas;
    try {
      estGas = await keyManager.methods.execute(payload).estimateGas({
        from,
      });
      console.log("Estimated Gas", estGas);
    } catch (error) {
      const errorObject = { message: "Failed to estimate gas:", error };
      console.error(errorObject);
      throw errorObject
    }

    try {
      return await keyManager.methods.execute(payload).send({
        from,
        gas: estGas + 1,
        gasPrice: await this.getFairGasPrice(this.web3),
      });
    } catch (error) {
      const errorObject = { message: "Failed to execute transaction:", error };
      console.error(errorObject);
      throw errorObject
    }
  }

  public async encodePayload(account: string, params: any) {
    const up = await this.getAccount(account);
    let { operation, to, value, data } = params;
    return await up.methods.execute(operation, to, value, data).encodeABI();
  }

  public async getKeyManager(account: string) {
    const myUniversalProfile = new this.web3.eth.Contract(
      UniversalProfile.abi as any,
      account
    );
    const keyManagerAddress = await myUniversalProfile.methods.owner().call();
    return new this.web3.eth.Contract(KeyManager.abi as any, keyManagerAddress);
  }

  public async getAccount(account: string) {
    return new this.web3.eth.Contract(UniversalProfile.abi as any, account);
  }
}
