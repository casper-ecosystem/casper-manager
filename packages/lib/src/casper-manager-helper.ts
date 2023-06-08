import { CLPublicKey, DeployUtil } from 'casper-js-sdk';
import {
  GetSnapCasperAccount,
  GetSnapCasperSign,
  GetSnapCasperSignMessage,
} from './types';
import { SNAP_ID } from './constants';

/**
 * Get a Casper Account from the snap.
 *
 * @param addressIndex - Address index wanted. Default to 0.
 * @param snapId - ID of the snap. Default to the npm lib.
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
  return CLPublicKey.fromHex(response.publicKey);
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
async function signDeploy(deploy: DeployUtil.Deploy, options: any = {}) {
  const response = (await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: options.snapID ?? SNAP_ID,
      request: {
        method: 'casper_sign',
        params: {
          addressIndex: options.addressIndex,
          deployJson: DeployUtil.deployToJson(deploy),
        },
      },
    },
  })) as unknown as GetSnapCasperSign;
  if (response.error) {
    throw new Error(response.error);
  }

  if (response.deploy) {
    const signedDeploy = DeployUtil.deployFromJson(response.deploy);
    if (signedDeploy.ok) {
      const validatedSignedDeploy = DeployUtil.validateDeploy(signedDeploy.val);
      if (validatedSignedDeploy.ok) {
        return validatedSignedDeploy.val;
      }
      throw validatedSignedDeploy.val;
    }
    throw signedDeploy.val;
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
  throw new Error('Rejected transaction.');
}

export { getAccount, signDeploy, signMessage };
