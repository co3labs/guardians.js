import { ERC725 } from '@erc725/erc725.js';
import LSP6Schema from '@erc725/erc725.js/schemas/LSP6KeyManager.json';
import Web3 from 'web3';

export default class ERC725Utils {
    private web3: Web3;

    constructor(web3: Web3) {
        this.web3 = web3;
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
}
