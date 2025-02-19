/* eslint-disable no-restricted-globals */
import { SNAP_ID, SNAP_VERSION } from './constants';
import type { GetSnapsResponse } from './types';

/**
 * Detect if the wallet injecting the ethereum object is Flask.
 *
 * @returns True if the MetaMask version is Flask, false otherwise.
 */
const isFlask = async () => {
  const provider = window.ethereum;

  try {
    const clientVersion = await provider?.request({
      method: 'web3_clientVersion',
    });

    const isFlaskDetected = (clientVersion as string[])?.includes('flask');

    return Boolean(provider && isFlaskDetected);
  } catch {
    return false;
  }
};

/**
 * Install the snap.
 *
 * @param snapID - ID of the snap. Default to the npm lib.
 * @param version - Version of the snap. Default to latest.
 */
async function installSnap(snapID = SNAP_ID, version = SNAP_VERSION) {
  await window.ethereum.request({
    method: 'wallet_requestSnaps',
    params: {
      [snapID]: {
        version,
      },
    },
  });
}

/**
 * Get the snap.
 *
 * @param snapID - ID of the snap. Default to the npm lib.
 * @returns The snap infos.
 */
async function getSnap(snapID = SNAP_ID) {
  const snaps = (await window.ethereum.request({
    method: 'wallet_getSnaps',
  })) as unknown as GetSnapsResponse;
  return Object.values(snaps).find((snap) => snap.id === snapID);
}

export { isFlask, installSnap, getSnap };
