import { Transaction } from "@elrondnetwork/erdjs/out/transaction"

export class Client{

    networks: Object
    gatewayURL: string
    network: string
    chainCodes: Object
    constructor(network="mainnet"){
        this.networks = {
            "mainnet": "https://gateway.elrond.com/",
            "devnet": "https://devnet-api.elrond.com",
            "testnet": "https://testnet-api.elrond.com"
        }
        this.chainCodes = {
            "mainnet": "1",
            "devnet": "D",
            "testnet": "T"
        }
        this.network = network
        this.gatewayURL = this.networks[network];
    }
    private async get(url){
        const response = await fetch(url)
        return response.json();
    }
    private async post(url, data){
        console.log("about to post");
        const response = await fetch(url, 
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        return response.json();
    }

    getChainCode(){
        return this.chainCodes[this.network]
    }

    setNetwork(network){
        this.network = network;
        this.gatewayURL = this.networks[network]
    }
    async getNonce(address) : Promise<number>{
        const url = `${this.gatewayURL}/address/${address}`
        const data = await this.get(url);
        return data.data.account.nonce;
    }

    async getBalance(address) : Promise<string>{
        const url = `${this.gatewayURL}/address/${address}`
        const data = await this.get(url);
        return data.data.account.balance;
    }

    async submitTx(tx: Transaction) : Promise<string>{
        console.log("submitting TX");
        const data = tx.toSendable();
        const url = `${this.gatewayURL}/transactions`;
        const response = await this.post(url, data);
        if(response.statusCode === 400){
            throw new Error(response.message)
        }
        console.log("post complete response is : ");
        console.log(response);
        const txHash = response.txHash;
        return txHash
    }
    async getTransactions(address){
        const url = `${this.gatewayURL}/${address}/transactions`
        const transactions = await this.get(url);
        console.log(transactions);
        return transactions;
    }

    async awaitTransaction(hash){
        const url = `${this.gatewayURL}/transaction/${hash}/status`
        const statusTable= {
        "success" : "success",
        "executed": "success",

        "pending" : "pending",
        "received": "pending",
        "partially-executed": "pending",

        "fail" : "fail",
        "not-executed" : "fail",
        "invalid" : "fail"
        }
        let status = "pending"
        let fails = 0;
        while(status !== "fail" && status !== "success"){
            let response = await this.get(url)
            if(response.code !== "successful"){
                console.log("request Failure")
                fails += 1
                if(fails > 3){
                    throw new Error("Error in awaiting transaction");
                }
                else{
                    continue
                }
            }
            status = statusTable[response.data.status];


        }
        return status;
    }
    
}