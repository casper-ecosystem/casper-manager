/* eslint-disable no-restricted-globals */
import { Deploy, PublicKey, TransactionV1 } from 'casper-js-sdk';

import { SNAP_ID } from './constants';
import type {
  GetSnapCasperAccount,
  GetSnapCasperSign,
  GetSnapCasperSignMessage,
} from './types';

/**
 * Get a Casper Account from the snap.
 *
 * @param addressIndex - Address index wanted. Default to 0.
 * @param snapId - ID of the snap. Default to the npm lib.
 * @returns A public key or throw an error.
 */
async function getAccount(addressIndex = 0, snapId = SNAP_ID) {
  const response = (await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId,
      request: {
        method: 'casper_getAccount',
        params: {
          addressIndex,
        },
      },
    },
  })) as unknown as GetSnapCasperAccount;
  if (response.error) {
    throw new Error(response.error);
  }
  return PublicKey.fromHex(response.publicKey);
}

/**
 * Sign a given Deploy Object with the corresponding public key.
 * You must pass the active public key from the user and the public key
 * where the deploy is going to be used.
 *
 * @param deploy - Deploy object.
 * @param options - Options object.
 * @returns Signed deploy object.
 */
async function signDeploy(deploy: Deploy, options: any = {}) {
  const response = (await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: options.snapID ?? SNAP_ID,
      request: {
        method: 'casper_sign',
        params: {
          addressIndex: options.addressIndex,
          deployJson: Deploy.toJSON(deploy),
        },
      },
    },
  })) as unknown as GetSnapCasperSign;
  if (response.error) {
    throw new Error(response.error);
  }

  if (response.deploy) {
    const signedDeploy = Deploy.fromJSON(response.deploy);
    if (signedDeploy.validate()) {
      return signedDeploy;
    }
    throw new Error('Deploy signature validation failed');
  }
  throw new Error('Rejected deploy.');
}

/**
 * Sign a given TransactionV1 Object with the corresponding public key.
 * You must pass the active public key from the user and the public key
 * where the transaction is going to be used.
 *
 * @param transaction - Transaction object.
 * @param options - Options object.
 * @returns Signed TransactionV1 object.
 */
async function signTransaction(transaction: TransactionV1, options: any = {}) {
  const response = (await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: options.snapID ?? SNAP_ID,
      request: {
        method: 'casper_sign',
        params: {
          addressIndex: options.addressIndex,
          transaction: TransactionV1.toJSON(transaction),
        },
      },
    },
  })) as unknown as GetSnapCasperSign;
  if (response.error) {
    throw new Error(response.error);
  }

  if (response.transaction) {
    const signedTransaction = TransactionV1.fromJSON(response.transaction);
    if (signedTransaction.validate()) {
      return signedTransaction;
    }
    throw new Error('Transaction signature validation failed');
  }
  throw new Error('Rejected transaction.');
}

/**
 * Sign a given string message with the corresponding public key.
 * You must pass the active public key from the user and the public key
 * where the deploy is going to be used.
 *
 * @param message - String message.
 * @param options - Options object.
 * @returns Message signature.
 */
async function signMessage(message: string, options: any = {}) {
  const response = (await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: options.snapID ?? SNAP_ID,
      request: {
        method: 'casper_signMessage',
        params: {
          addressIndex: options.addressIndex,
          message,
        },
      },
    },
  })) as unknown as GetSnapCasperSignMessage;
  if (response.error) {
    throw new Error(response.error);
  }

  if (response.signature) {
    return response.signature;
  }
  throw new Error('Rejected message.');
}

export { getAccount, signDeploy, signTransaction, signMessage };
