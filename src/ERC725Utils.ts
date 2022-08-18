import { ERC725 } from '@erc725/erc725.js';
import LSP6Schema from '@erc725/erc725.js/schemas/LSP6KeyManager.json';
import UniversalProfile from "@lukso/lsp-smart-contracts/artifacts/UniversalProfile.json";
import KeyManager from "@lukso/lsp-smart-contracts/artifacts/LSP6KeyManager.json";
import Utils from './Utils';
import Web3 from 'web3';

export default class ERC725Utils {
    private web3: Web3;
    private utils: Utils;

    constructor(web3: Web3) {
        this.web3 = web3;
        this.utils = new Utils(web3);
    }

    public async canAddPermissions(controller: string, account: string): Promise<boolean> {

        if (!this.web3.utils.isAddress(controller) || !this.web3.utils.isAddress(account)) {
            return false
        }

        const erc725 = new ERC725(
            LSP6Schema as any,
            account,
            this.web3.currentProvider,
        );

        const result = await erc725.getData('AddressPermissions[]') as any;
        let addresses = result.value;
        if (addresses.length == 0) {
            return false;
        }

        // check if our controller address exists in this list
        let index = addresses.indexOf(controller.toLowerCase()) + addresses.indexOf(this.web3.utils.toChecksumAddress(controller))
        if (index < -1) {
            console.log("Index - ", index)
            return false;
        }

        // get the permissions of our controller address
        const addressPermission = await erc725.getData({
            keyName: 'AddressPermissions:Permissions:<address>',
            dynamicKeyParts: controller,
        });

        //decode the permission of our controller address
        const decodedPermission = erc725.decodePermissions(addressPermission.value as any);

        // check if our controller has ADDPERMISSIONS permission
        if (decodedPermission["ADDPERMISSIONS"]) {
            console.log(`${controller} has ADDPERMISSIONS`);
            return true;
        }

        return false;
    }

    public async grantAddPermissions(controller: string, beneficiary: string, account: string) {

        const erc725 = new ERC725(
            LSP6Schema as any,
            account,
            this.web3.currentProvider,
        );

        // create instance of UniversalProfile and KeyManager contracts
        const accountInst = new this.web3.eth.Contract(UniversalProfile.abi as any, account);

        // setup the permissions of the beneficiary address
        const beneficiaryPermissions = erc725.encodePermissions({
            ADDPERMISSIONS: true,
        });

        // encode the data key-value pairs of the permissions to be set
        const data = erc725.encodeData({
            keyName: "AddressPermissions:Permissions:<address>",
            dynamicKeyParts: beneficiary,
            value: beneficiaryPermissions,
        } as any);

        console.log(data);

        // encode the payload to be sent to the Key Manager contract
        const payload = accountInst.methods["setData(bytes32,bytes)"](data.keys[0], data.values[0]).encodeABI();

        // send the transaction via the Key Manager contract
        await this.utils.execute(payload, controller, account);
    }
}
