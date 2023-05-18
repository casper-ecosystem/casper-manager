import { Buffer } from 'buffer/';
import { CLPublicKey, DeployUtil, Keys } from 'casper-js-sdk';
import { GetSnapCasperAccount, GetSnapCasperSign } from './types';
import { deployToObject, SNAP_ID } from './utils';

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
  const publicKeyBytes = Buffer.from(response.publicKey, 'hex');
  if (response.curve === Keys.SignatureAlgorithm.Ed25519) {
    return new CLPublicKey(
      publicKeyBytes,
      Keys.SignatureAlgorithm.Ed25519,
    ).toHex();
  }

  if (response.curve === Keys.SignatureAlgorithm.Secp256K1) {
    return new CLPublicKey(
      publicKeyBytes,
      Keys.SignatureAlgorithm.Secp256K1,
    ).toHex();
  }
  throw new Error(
    `Unsupported curve. Received ${response.curve}. Only Secp256K1 && Ed25519 are supported.`,
  );
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
          deployInfo: deployToObject(deploy, options.publicKey),
          message: Buffer.from(deploy.hash).toString('hex'),
        },
      },
    },
  })) as unknown as GetSnapCasperSign;
  if (response) {
    const signedDeploy = DeployUtil.setSignature(
      deploy,
      Buffer.from(response.signature, 'hex'),
      CLPublicKey.fromHex(options.publicKey),
    );
    const validatedSignedDeploy = DeployUtil.validateDeploy(signedDeploy);
    if (validatedSignedDeploy.ok) {
      return validatedSignedDeploy.val;
    }
    throw validatedSignedDeploy.val;
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
        method: 'casper_sign_message',
        params: {
          addressIndex: options.addressIndex,
          message,
        },
      },
    },
  })) as unknown as GetSnapCasperSign;
  if (response) {
    return response.signature;
  }
  throw new Error('Rejected transaction.');
}

export { getAccount, signDeploy, signMessage };
