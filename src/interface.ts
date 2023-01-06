export interface UserTxn{

    value: string;
    gasPrice?: number;
    gasLimit?: number;
    receiver: string;
    sender?: string;
    version?: number;
    data?: string;
    nonce?: number;
    signature?: string;
}