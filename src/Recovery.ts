import Web3 from "web3";
import LSP11Artifacts from "./artifacts/LSP11BasicSocialRecovery.json";
import ERC725Utils from "./ERC725Utils";
import Utils from './Utils';

export default class Recovery {
    private artifacts: any;
    private web3: Web3;
    private utils: Utils;
    private erc725Utils: ERC725Utils;


    constructor(_web3: Web3) {
        this.web3 = _web3;
        this.artifacts = LSP11Artifacts;
        this.utils = new Utils(_web3);
        this.erc725Utils = new ERC725Utils(_web3);

    }

    /**
     * Deploys a Recovery Vault contract via Key Manager
     * @param account 
     * @returns 
     */
    public async createRecoveryVault(account: string) {
        let params = {
            operation: 1, //deploy new contract
            to: '0x0000000000000000000000000000000000000000',
            value: 0,
            data: this.artifacts.bytecode + this.web3.utils.padLeft(account.substring(2), 64, '0') //LSP11 bytecode + constructor
        }
        let payload = await this.utils.encodePayload(account, params);
        console.log(payload);
        const tx = await this.utils.execute(payload, this.web3.eth.defaultAccount, account);
        console.log(tx);
        return tx;
    }

    /**
     * Adds a guardian to the Recovery Vault
     * @param vaultAddress
     * @param newGuardian 
     * @param account 
     * @returns 
     */
    public async addGuardian(vaultAddress: string, newGuardian: string, account: string) {
        const recoveryVault = new this.web3.eth.Contract(this.artifacts.abi as any, vaultAddress);
        const targetPayload = recoveryVault.methods.addGuardian(newGuardian).encodeABI();

        let params = {
            operation: 0, //calls Recovery Vault
            to: vaultAddress,
            value: 0,
            data: targetPayload //call to addGuardian() func
        }
        let payload = await this.utils.encodePayload(account, params);
        console.log(payload);
        const tx = await this.utils.execute(payload, this.web3.eth.defaultAccount, account);
        console.log(tx);
        return tx;
    }

    /**
     * Removes an exisiting guardian from the Recovery Vault
     * @param currentGuardian 
     * @param vaultAddress
     * @param account 
     * @returns 
     */
    public async removeGuardian(currentGuardian: string, vaultAddress: string, account: string) {
        const recoveryVault = new this.web3.eth.Contract(this.artifacts.abi as any, vaultAddress);
        const targetPayload = recoveryVault.methods.removeGuardian(currentGuardian).encodeABI();

        let params = {
            operation: 0, //calls Recovery Vault
            to: vaultAddress,
            value: 0,
            data: targetPayload //call to removeGuardian() func
        }
        let payload = await this.utils.encodePayload(account, params);
        console.log(payload);
        const tx = await this.utils.execute(payload, this.web3.eth.defaultAccount, account);
        console.log(tx);
        return tx;
    }

    /**
    * Sets the minimum number of guardians required to vote so that a
    * controller address can recover ownership
    * @param guardiansThreshold 
    * @param vaultAddress
    * @param account 
    * @returns 
    */
    public async setThreshold(guardiansThreshold: number, vaultAddress: string, account: string) {
        const recoveryVault = new this.web3.eth.Contract(this.artifacts.abi as any, vaultAddress);
        const targetPayload = recoveryVault.methods.setThreshold(guardiansThreshold).encodeABI();

        let params = {
            operation: 0, //calls Recovery Vault
            to: vaultAddress,
            value: 0,
            data: targetPayload //call to setThreshold() func
        }
        let payload = await this.utils.encodePayload(account, params);
        console.log(payload);
        const tx = await this.utils.execute(payload, this.web3.eth.defaultAccount, account);
        console.log(tx);
        return tx;
    }

    /**
    * Sets the owner secret that will be used to recover owner account
    * @param newSecret 
    * @param vaultAddress
    * @param account 
    * @returns 
    */
    public async setSecret(newSecret: string, vaultAddress: string, account: string) {
        const recoveryVault = new this.web3.eth.Contract(this.artifacts.abi as any, vaultAddress);
        const secretHash = this.web3.utils.asciiToHex(newSecret);
        const targetPayload = recoveryVault.methods.setSecret(secretHash).encodeABI();

        let params = {
            operation: 0, //calls Recovery Vault
            to: vaultAddress,
            value: 0,
            data: targetPayload //call to setSecret() func
        }
        let payload = await this.utils.encodePayload(account, params);
        console.log(payload);
        const tx = await this.utils.execute(payload, this.web3.eth.defaultAccount, account);
        console.log(tx);
        return tx;
    }

    /**
    * Submit a vote to allow an address `newOwner` to recover its owner
    * permissions once the votes threshold is reached.
    * @param recoverProcessId 
    * @param newOwner 
    * @param vaultAddress
    * @param account 
    * @returns 
    */
    public async voteToRecover(recoverProcessId: string, newOwner: string, vaultAddress: string, account: string) {
        const recoveryVault = new this.web3.eth.Contract(this.artifacts.abi as any, vaultAddress);
        const recoverProcessIdInBytes = this.web3.utils.asciiToHex(recoverProcessId);
        const targetPayload = recoveryVault.methods.voteToRecover(recoverProcessIdInBytes, newOwner).encodeABI();

        let params = {
            operation: 0, //calls Recovery Vault
            to: vaultAddress,
            value: 0,
            data: targetPayload //call to voteToRecover() func
        }

        let payload = await this.utils.encodePayload(account, params);
        console.log(payload);
        const tx = await this.utils.execute(payload, this.web3.eth.defaultAccount, account);
        console.log(tx);
        return tx;
    }

    /**
     * Returns the addresses of all guardians
     * The guardians will vote for an address to be added as a controller
     * key for the linked `account`.
     * @param vaultAddress
     * @returns string[]
     */
    public async getGuardians(vaultAddress: string): Promise<string[]> {
        const recoveryVault = new this.web3.eth.Contract(this.artifacts.abi as any, vaultAddress);
        return await recoveryVault.methods.getGuardians().call();
    }

    /**
    * Returns TRUE if the `guardianAddress` provided is a guardian, FALSE otherwise
    * @param vaultAddress 
    * @param guardianAddress 
    * @returns 
    */
    public async isGuardian(vaultAddress: string, guardianAddress: string,): Promise<boolean> {
        const recoveryVault = new this.web3.eth.Contract(this.artifacts.abi as any, vaultAddress);
        return await recoveryVault.methods.isGuardian(guardianAddress).call();
    }

    /**
     * Returns all the RecoverProcessesIds
     * The RecoverProcessesIds are the channels that guardians can vote on if the
     * guardians didn't reach consensus on an address in one recover process id they
     * can start voting on another one.
     * @param vaultAddress 
     */
    public async getRecoverProcessesIds(vaultAddress: string): Promise<string[]> {
        const recoveryVault = new this.web3.eth.Contract(this.artifacts.abi as any, vaultAddress);
        let recoverProcessIdInBytes = await recoveryVault.methods.getRecoverProcessesIds().call();
        let recoverProcessesIds = recoverProcessIdInBytes.map(processId => this.web3.utils.toAscii(processId));
        return recoverProcessesIds;
    }

    /**
     * Returns the guardian threshold
     * The guardian threshold represents the minimum number of guardians required
     * to vote in order to start a recovery process.
     * @param vaultAddress 
     */
    public async getGuardiansThreshold(vaultAddress: string): Promise<number> {
        const recoveryVault = new this.web3.eth.Contract(this.artifacts.abi as any, vaultAddress);
        return await recoveryVault.methods.getGuardiansThreshold().call();
    }

    /**
     * Get the address of a controller that a `guardian` voted for in order to recover its permissions.
     * @param vaultAddress 
     * @param recoverProcessId 
     * @param guardianAddress 
     * @returns 
     */
    public async getGuardianVote(vaultAddress: string, recoverProcessId: string, guardianAddress: string): Promise<string> {
        const recoveryVault = new this.web3.eth.Contract(this.artifacts.abi as any, vaultAddress);
        const recoverProcessIdInBytes = this.web3.utils.asciiToHex(recoverProcessId);
        return await recoveryVault.methods.getGuardianVote(recoverProcessIdInBytes, guardianAddress).call();
    }

    /**
     * Get the 'account' controlling the recovery vault.
     * @param vaultAddress 
     * @returns 
     */
    public async getAccount(vaultAddress: string): Promise<string> {
        const recoveryVault = new this.web3.eth.Contract(this.artifacts.abi as any, vaultAddress);
        return await recoveryVault.methods.account().call();
    }


    /**
     * Recovers the ownership permissions of an address in the linked `account()`
     * and increment the recover counter
     *
     * Requirements
     *     - the address of the caller must have at least received the minimum number of votes defined in `getGuardiansThreshold(...)`
     *     - the address must have provided the right `plainSecret` that produces the secret Hash
     *
     * @param vaultAddress 
     * @param account 
     * @param recoverProcessId 
     * @param oldSecret 
     * @param newSecret 
     * @returns 
     */
    public async recoverOwnership(
        vaultAddress: string,
        account: string,
        recoverProcessId: string,
        oldSecret: string,
        newSecret: string
    ) {
        const recoveryVault = new this.web3.eth.Contract(this.artifacts.abi as any, vaultAddress);
        const newSecretHash = this.web3.utils.asciiToHex(newSecret);
        const recoverProcessIdInBytes = this.web3.utils.asciiToHex(recoverProcessId);
        const targetPayload = recoveryVault.methods.recoverOwnership(recoverProcessIdInBytes, oldSecret, newSecretHash).encodeABI();

        let params = {
            operation: 0, //calls Recovery Vault
            to: vaultAddress,
            value: 0,
            data: targetPayload //call to recoverOwnership() func
        }
        let payload = await this.utils.encodePayload(account, params);
        console.log(payload);
        const tx = await this.utils.execute(payload, this.web3.eth.defaultAccount, account);
        console.log(tx);
        return tx;
    }

    /**
     * Checks if a given controller has necessary ADDPERMISSIONS on ERC725Account
     * to create a Recovery Vault for that account.
     * @param controller 
     * @param account 
     * @returns 
     */
    public async canCreateRecoveryVault(controller: string, account: string): Promise<boolean> {
        return this.erc725Utils.canAddPermissions(controller, account);
    }

}


