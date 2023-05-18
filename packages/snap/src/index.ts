import { OnRpcRequestHandler } from '@metamask/snaps-types';
import { getBIP44AddressKeyDeriver } from '@metamask/key-tree';
import * as nacl from 'tweetnacl-ts';
import { sha256 } from 'ethereum-cryptography/sha256';
import { ecdsaSign } from 'ethereum-cryptography/secp256k1-compat';
import { copyable, heading, NodeType, panel, text } from '@metamask/snaps-ui';

// eslint-disable-next-line @typescript-eslint/no-require-imports,@typescript-eslint/no-var-requires,import/no-extraneous-dependencies
globalThis.Buffer = require('buffer/').Buffer;

/**
 * Get casper address.
 *
 * @param addressIndex - Address index.
 */
async function getCSPRAddress(addressIndex = 0) {
  const bip44Node = await snap.request({
    method: 'snap_getBip44Entropy',
    params: {
      coinType: 506,
    },
  });
  const bip44Nodeaddr = await getBIP44AddressKeyDeriver(bip44Node);
  const addressKey0 = await bip44Nodeaddr(addressIndex);
  return {
    publicKey: Buffer.from(addressKey0.compressedPublicKeyBytes).toString(
      'hex',
    ),
    curve: addressKey0.curve,
  };
}

/**
 * Displays a prompt to the user in the MetaMask UI.
 *
 * @param deployInfo - Object that represent the info of the deploy.
 * @returns `true` if the user accepted the confirmation,
 * and `false` otherwise.
 */
async function promptUserDeployInfo(deployInfo: any) {
  const deployArgComponents: {
    value: string;
    type: NodeType.Text | NodeType.Copyable;
  }[] = [];
  Object.entries(deployInfo.deployArgs).forEach((arg: any) => {
    if (Array.isArray(arg[1])) {
      const value = arg[1].map((v: any) => copyable(v));
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
        panel([heading('Deploy Arguments'), ...deployArgComponents]),
      ]),
    },
  });
}

/**
 * Sign a deploy.
 *
 * @param deployInfo - Confirmation message.
 * @param deployHash - Message.
 * @param addressIndex - Address index.
 */
async function sign(deployInfo: any, deployHash: string, addressIndex = 0) {
  const bip44Node = await snap.request({
    method: 'snap_getBip44Entropy',
    params: {
      coinType: 506,
    },
  });
  const message = Buffer.from(deployHash, 'hex');
  const bip44Nodeaddr = await getBIP44AddressKeyDeriver(bip44Node);
  const addressKey0 = await bip44Nodeaddr(addressIndex);
  const response = await promptUserDeployInfo(deployInfo);
  if (!response) {
    return false;
  }

  if (addressKey0.privateKeyBytes) {
    if (addressKey0.curve === 'ed25519') {
      return {
        signature: Buffer.from(
          nacl.sign_detached(message, addressKey0.privateKeyBytes),
        ).toString('hex'),
      };
    }

    if (addressKey0.curve === 'secp256k1') {
      const res = ecdsaSign(
        sha256(Buffer.from(message)),
        addressKey0.privateKeyBytes,
      );
      return { signature: Buffer.from(res.signature).toString('hex') };
    }
    return {
      error: `Unsupported curve : ${addressKey0.curve}. Only Secp256K1 && Ed25519 are supported.`,
    };
  }
  return { error: 'No private key associated with the account.' };
}

/**
 * Sign a message.
 *
 * @param msg - Message.
 * @param addressIndex - Address index.
 */
async function signMessage(msg: string, addressIndex = 0) {
  const bip44Node = await snap.request({
    method: 'snap_getBip44Entropy',
    params: {
      coinType: 506,
    },
  });
  const bip44Nodeaddr = await getBIP44AddressKeyDeriver(bip44Node);
  const addressKey0 = await bip44Nodeaddr(addressIndex);
  const message = Uint8Array.from(Buffer.from(`Casper Message:\n${msg}`));
  const response = await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'confirmation',
      content: panel([heading(`Sign message`), text('Message'), copyable(msg)]),
    },
  });

  if (!response) {
    return false;
  }

  if (addressKey0.privateKeyBytes) {
    if (addressKey0.curve === 'ed25519') {
      return {
        signature: Buffer.from(
          nacl.sign_detached(message, addressKey0.privateKeyBytes),
        ).toString('hex'),
      };
    }

    if (addressKey0.curve === 'secp256k1') {
      const res = ecdsaSign(sha256(message), addressKey0.privateKeyBytes);
      return { signature: Buffer.from(res.signature).toString('hex') };
    }
    return {
      error: `Unsupported curve : ${addressKey0.curve}. Only Secp256K1 && Ed25519 are supported.`,
    };
  }
  return { error: 'No private key associated with the account.' };
}

/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
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
      return sign(
        request?.params?.deployInfo,
        request?.params?.message,
        request?.params?.addressIndex,
      );
    case 'casper_signMessage':
      return signMessage(
        request?.params?.message,
        request?.params?.addressIndex,
      );
    default:
      throw new Error('Method not found.');
  }
};
