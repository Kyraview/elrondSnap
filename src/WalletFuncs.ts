import { Transaction, TokenPayment, TransactionPayload } from "@elrondnetwork/erdjs/out";
import { userAccount } from "./Accounts";
import { Client } from "./Client";
import { Address } from "@elrondnetwork/erdjs/out/address";
import { Utils } from "./Utils";
import { UserTxn } from "./interface";



export class WalletFuncts{
    
    account: userAccount
    client: Client
    origin: string


    constructor(account: userAccount, client: Client, origin: string){
        this.account = account;
        this.client = client;
        this.origin = origin;
    }

    private async UserTxnTotransaction(txnJSON: UserTxn): Promise<Transaction>{
        let nonce;
        let data;
        let sender;
        let receiver;
        let gasPrice;
        let gasLimit;
        let version;
        let value;
        const chainID = this.client.getChainCode()

        //data
        if(txnJSON.data !== null && txnJSON !== undefined){
            data = new TransactionPayload(txnJSON.data)
        }

        //nonce
        if(txnJSON.nonce === null || txnJSON.nonce === undefined){
            nonce = await this.client.getNonce(this.account.address)
        }
        else{
            nonce = txnJSON.nonce;
        }

        //sender
        if(txnJSON.sender === null || txnJSON.sender === undefined){
            sender = new Address(this.account.address);
        }
        else{
            sender = new Address(txnJSON.sender);
        }

        //receiver
        if(txnJSON.receiver){
            receiver = new Address(txnJSON.receiver);
        }
        else{
            throw new Error("Transaction is inComplete requires receiver")
        }

        //value
        if(txnJSON.value === null || txnJSON.value === undefined){
            throw new Error("Transaction is inComplete requires value")
        }
        else{
            value = txnJSON.value
        }

        //gasPrice
        if(txnJSON.gasPrice !== null && txnJSON.gasPrice !== undefined){
            gasPrice = txnJSON.gasPrice
        }

        //gasLimit
        if(txnJSON.gasLimit !== null && txnJSON.gasLimit !== undefined){
            gasLimit = txnJSON.gasLimit
        }

        //version
        if(txnJSON.version !== null && txnJSON.version !== undefined ){
            version = txnJSON.version;
        }

        
        return new Transaction({nonce, value, receiver, sender, gasPrice, gasLimit, data, chainID, version})

    }



    async SendValue(receiver, amount, gasLimit=70000, data=""){
        const confirmed = await Utils.confirm("confirm spend", 
         this.client.network, 
         `confirm spend:\n${amount} XeGLD\n${Utils.shortenAddress(receiver)} `
        )
        if(!confirmed){
            throw new Error("User Rejected Request");
        }
        let nonce = await this.client.getNonce(this.account.address);
        
        let tx = new Transaction({
            data: new TransactionPayload(data),
            gasLimit: gasLimit,
            receiver: new Address(receiver),
            sender: new Address(this.account.address),
            value: TokenPayment.egldFromAmount(amount),
            chainID: this.client.getChainCode(),
            nonce: nonce
        });
        
        await this.account.Signer.sign(tx);
        const hash = await this.client.submitTx(tx);
        const status = await this.client.awaitTransaction(hash);
        Utils.notify("transaction "+status)
        return hash;
    }

    
    async signTxn(txnJSON: UserTxn){
        
        const confirmed = await Utils.confirm("Sign TXN?", 
        this.client.network, 
        `confirm sign:\n${txnJSON.value} XeGLD\n${Utils.shortenAddress(txnJSON.receiver)} `
        )
        if(!confirmed){
            throw new Error("User Rejected Request");
        }
        const txn = await this.UserTxnTotransaction(txnJSON);
        this.account.Signer.sign(txn);
        
        return txn;
    }

    async signAndSubmitTxn(txnJSON: UserTxn){
        const confirmed = await Utils.confirm("Sign TXN?", 
        this.client.network, 
        `confirm sign:\n${txnJSON.value} XeGLD\n${Utils.shortenAddress(txnJSON.receiver)} `
        )
        if(!confirmed){
            throw new Error("User Rejected Request");
        }
        const txn = await this.UserTxnTotransaction(txnJSON);

        this.account.Signer.sign(txn);
        const hash = await this.client.submitTx(txn)
        const status = await this.client.awaitTransaction(hash);
        Utils.notify("transaction "+status);
        return hash;

    }
}