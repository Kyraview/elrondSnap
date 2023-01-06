import {UserSecretKey, UserPublicKey, UserSigner, Mnemonic } from '@elrondnetwork/erdjs-walletcore/out';
import { JsonBIP44CoinTypeNode } from '@metamask/key-tree';
import sha256 from 'crypto-js/sha256';
import Hex from 'crypto-js/enc-hex'
import * as bip39 from "bip39"



export interface userAccount{
    SK: UserSecretKey,
    PK: UserPublicKey,
    Signer: UserSigner,
    name: string,
    address: string
}

export class Account{
    SK: UserSecretKey
    PK: UserPublicKey
    Signer: UserSigner
    AccountData: null | Record<string, unknown>
    addr: string

    async init(): Promise<userAccount>{
        this.AccountData = await wallet.request({
            method: 'snap_manageState',
            params: ['get'],
        })
        if(this.AccountData === null){
            return await this.createNewAccount(this.AccountData)
        }
        return this.getCurrentAccount(this.AccountData)
    }

    async createNewAccount(AccountData, name?): Promise<userAccount>{
        if(!name){
            name = "Account 1";
        }
        const entropy = (await wallet.request({
            method: 'snap_getBip44Entropy',
            params: {
              coinType: 508,
            },
        }) as JsonBIP44CoinTypeNode).privateKey;
        console.log(entropy);
        console.log(typeof entropy);
        console.log("here")
        let hashedEntropy = sha256(entropy)
        
        console.log("hashed entropy")
        console.log(hashedEntropy)
        const textMnemonic = bip39.entropyToMnemonic(Hex.stringify(hashedEntropy))
        console.log("text mnemonic generated")
        const mnemonic = Mnemonic.fromString(textMnemonic)
        
        const SK = mnemonic.deriveKey();
        const PK = SK.generatePublicKey();
        const Signer = new UserSigner(SK);
        const addr :string = PK.toAddress().bech32()
        if(AccountData === null){
            AccountData = {"currentAccount": "", "Accounts":{}}
        }
        AccountData.currentAccount = addr;
        const mnemonicString : string = mnemonic.toString()
        AccountData.Accounts[addr] = {name: name, addr: addr, mnemonic: mnemonicString}
        console.log(AccountData)
        console.log(JSON.stringify(AccountData))
        await wallet.request({
            method: 'snap_manageState',
            params: ['update', AccountData]
        })
        return {
            SK: SK,
            PK: PK,
            Signer: Signer,
            name: name,
            address: addr
        }

    }

    getCurrentAccount(state): userAccount{
        const addr = state.currentAccount;
        const data = state.Accounts[addr];
        const name = data.name;
        const mnemonicText = data.mnemonic;
        const mnemonic = Mnemonic.fromString(mnemonicText)
        const SK = mnemonic.deriveKey()
        const PK = SK.generatePublicKey()
        const Signer = new UserSigner(SK);
        return {
            name: name,
            address: addr,
            SK: SK,
            PK: PK,
            Signer: Signer
        }

    }
}