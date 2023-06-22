import { getBIP44AddressKeyDeriver } from '@metamask/key-tree';
import { OnRpcRequestHandler } from '@metamask/snaps-types';
import { copyable, heading, NodeType, panel, text } from '@metamask/snaps-ui';
import { CLPublicKey, DeployUtil, Keys } from 'casper-js-sdk';
import { ecdsaSign } from 'ethereum-cryptography/secp256k1-compat';
import { sha256 } from 'ethereum-cryptography/sha256';
import * as nacl from 'tweetnacl-ts';

import { addSignatureAndValidateDeploy, deployToObject } from './utils';

// eslint-disable-next-line
globalThis.Buffer = require('buffer/').Buffer;

/**
 * Get casper address.
 * @param addressIndex - Address index.
 * @returns Object - Either contains a publicKey string or error string.
 */
async function getCSPRAddress(addressIndex = 0) {
  const bip44Node = await snap.request({
    method: 'snap_getBip44Entropy',
    params: {
      coinType: 506,
    },
  });
  const bip44Nodeaddr = await getBIP44AddressKeyDeriver(bip44Node);
  const addressKey = await bip44Nodeaddr(addressIndex);
  if (addressKey.curve === Keys.SignatureAlgorithm.Ed25519) {
    return {
      publicKey: new CLPublicKey(
        addressKey.compressedPublicKeyBytes,
        Keys.SignatureAlgorithm.Ed25519,
      ).toHex(),
    };
  }

  if (addressKey.curve === Keys.SignatureAlgorithm.Secp256K1) {
    return {
      publicKey: new CLPublicKey(
        addressKey.compressedPublicKeyBytes,
        Keys.SignatureAlgorithm.Secp256K1,
      ).toHex(),
    };
  }
  return {
    error: `Unsupported curve. Received ${
      addressKey.curve as string
    }. Only Secp256K1 && Ed25519 are supported.`,
  };
}

/**
 * Displays a prompt to the user in the MetaMask UI.
 * @param deploy - Deploy object that will be parsed to display the content of if.
 * @param signingKey - Hex encoded public key address.
 * @returns `true` if the user accepted the confirmation,
 * and `false` otherwise.
 */
async function promptUserDeployInfo(
  deploy: DeployUtil.Deploy,
  signingKey: string,
) {
  const deployInfo = deployToObject(deploy, signingKey);
  const deployArgComponents: {
    value: string;
    type: NodeType.Text | NodeType.Copyable;
  }[] = [];
  Object.entries(deployInfo.deployArgs).forEach((arg: any) => {
    if (Array.isArray(arg[1])) {
      const value = arg[1].map((val: any) => copyable(val));
      deployArgComponents.push(text(arg[0]), ...value);
    } else {
      deployArgComponents.push(text(arg[0]), copyable(arg[1]));
    }
  });
  return await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'confirmation',
      content: panel([
        heading(`Sign ${deployInfo.deployType}`),
        text('Deploy Hash'),
        copyable(deployInfo.deployHash),
        text('Signing Key'),
        copyable(deployInfo.signingKey),
        text('Account'),
        copyable(deployInfo.account),
        text('Body Hash'),
        copyable(deployInfo.bodyHash),
        text('Chain Name'),
        copyable(deployInfo.chainName),
        text('Timestamp'),
        copyable(deployInfo.timestamp),
        text('Gas'),
        copyable(deployInfo.payment),
        text('Gas (Motes)'),
        copyable(deployInfo.paymentMotes),
        panel([heading('Deploy Arguments'), ...deployArgComponents]),
      ]),
    },
  });
}

/**
 * Sign a deploy.
 * @param deployJson - JSON formatted deploy.
 * @param addressIndex - Address index.
 * @returns Object - Either an object with a deploy json string or error string.
 */
async function sign(deployJson: string, addressIndex = 0) {
  const publicKeyHex = (await getCSPRAddress(addressIndex)).publicKey;
  if (!publicKeyHex) {
    return { error: `Unable to get public key at index ${addressIndex}.` };
  }
  const deploy = DeployUtil.deployFromJson(deployJson);
  if (!(deploy.val instanceof DeployUtil.Deploy)) {
    return { error: 'Unable to convert json into deploy object.' };
  }
  const deployHash = Buffer.from(deploy.val.hash).toString('hex');
  const bip44Node = await snap.request({
    method: 'snap_getBip44Entropy',
    params: {
      coinType: 506,
    },
  });
  const message = Buffer.from(deployHash, 'hex');
  const bip44Nodeaddr = await getBIP44AddressKeyDeriver(bip44Node);
  const addressKey = await bip44Nodeaddr(addressIndex);
  const response = await promptUserDeployInfo(deploy.val, publicKeyHex);
  if (!response) {
    return false;
  }

  if (addressKey.privateKeyBytes) {
    if (addressKey.curve === 'ed25519') {
      const signature = Buffer.from(
        nacl.sign_detached(message, addressKey.privateKeyBytes),
      );
      return addSignatureAndValidateDeploy(deploy.val, signature, publicKeyHex);
    }

    if (addressKey.curve === 'secp256k1') {
      const res = ecdsaSign(
        sha256(Buffer.from(message)),
        addressKey.privateKeyBytes,
      );
      const signature = Buffer.from(res.signature);
      return addSignatureAndValidateDeploy(deploy.val, signature, publicKeyHex);
    }
    return {
      error: `Unsupported curve : ${
        addressKey.curve as string
      }. Only Secp256K1 && Ed25519 are supported.`,
    };
  }
  return {
    error: `No private key associated with the account ${addressIndex}.`,
  };
}

/**
 * Sign a message.
 * @param message - Message.
 * @param addressIndex - Address index.
 * @returns Object - Either an object with a signature string or error string.
 */
async function signMessage(message: string, addressIndex = 0) {
  const bip44Node = await snap.request({
    method: 'snap_getBip44Entropy',
    params: {
      coinType: 506,
    },
  });
  const bip44Nodeaddr = await getBIP44AddressKeyDeriver(bip44Node);
  const addressKey0 = await bip44Nodeaddr(addressIndex);
  const messageBytes = Uint8Array.from(
    Buffer.from(`Casper Message:\n${message}`),
  );
  const response = await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'confirmation',
      content: panel([
        heading(`Sign message`),
        text('Message'),
        copyable(message),
      ]),
    },
  });

  if (!response) {
    return false;
  }

  if (addressKey0.privateKeyBytes) {
    if (addressKey0.curve === 'ed25519') {
      return {
        signature: Buffer.from(
          nacl.sign_detached(messageBytes, addressKey0.privateKeyBytes),
        ).toString('hex'),
      };
    }

    if (addressKey0.curve === 'secp256k1') {
      const res = ecdsaSign(sha256(messageBytes), addressKey0.privateKeyBytes);
      return { signature: Buffer.from(res.signature).toString('hex') };
    }
    return {
      error: `Unsupported curve : ${
        addressKey0.curve as string
      }. Only Secp256K1 && Ed25519 are supported.`,
    };
  }
  return { error: 'No private key associated with the account.' };
}

/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 * @param args - The request handler args as object.
 * @param args.origin - The origin of the request, e.g., the website that
 * invoked the snap.
 * @param args.request - A validated JSON-RPC request object.
 * @returns `null` if the request succeeded.
 * @throws If the request method is not valid for this snap.
 * @throws If the `snap_confirm` call failed.
 */
export const onRpcRequest: OnRpcRequestHandler = async ({
  origin,
  request,
}) => {
  console.log(origin, request);
  switch (request.method) {
    case 'casper_getAccount':
      return getCSPRAddress(request?.params?.addressIndex);
    case 'casper_sign':
      return sign(request?.params?.deployJson, request?.params?.addressIndex);
    case 'casper_signMessage':
      return signMessage(
        request?.params?.message,
        request?.params?.addressIndex,
      );
    default:
      throw new Error('Method not found.');
  }
};
