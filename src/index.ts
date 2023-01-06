import { OnRpcRequestHandler } from '@metamask/snap-types';
import { OnCronjobHandler } from '@metamask/snap-types';
import { ApiNetworkProvider } from "@elrondnetwork/erdjs-network-providers";
import { Mnemonic } from '@elrondnetwork/erdjs-walletcore/out';
import {UserSecretKey, UserPublicKey, UserSigner } from '@elrondnetwork/erdjs-walletcore/out';
import { Account } from './Accounts';
import {Client} from './Client';
import { WalletFuncts } from './WalletFuncs';
import { Utils } from './Utils';
import { UserTxn } from './interface';
let networkProvider = new ApiNetworkProvider("https://devnet-api.elrond.com");

export const onRpcRequest: OnRpcRequestHandler = async ({ origin, request }) => {
  const AccountLib = new Account;
  const account = await AccountLib.init()
  const client = new Client("devnet");
  const functs = new WalletFuncts(account, client, origin);
  const params = request.params
  
  switch (request.method) {
    case 'getAddress':
      return account.address;
    
    case 'getNonce':
      return client.getNonce(account.address);

    case 'transfer':
      return functs.SendValue(params.to, params.amount)
    
    case 'getBalance':
      return client.getBalance(account.address)

    case 'signAndSubmitTxn':
      return functs.signAndSubmitTxn(params.txn as UserTxn)

    default:
      throw new Error('Method not found.');
  }
};

export const onCronjob: OnCronjobHandler = async ({ request }) => {
  switch (request.method) {
    case 'cron':
      console.log(request.params.go);
      console.log("here")
      //return Utils.confirm("here", "here")
      return 0;

    default:
      throw new Error('Method not found.');
  }
};