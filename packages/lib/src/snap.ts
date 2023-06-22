import { SNAP_ID } from './constants';
import { GetSnapsResponse, Snap } from './types';

/**
 * Detect if the wallet injecting the ethereum object is Flask.
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
 * @param snapID - ID of the snap. Default to the npm lib.
 */
async function installSnap(snapID = SNAP_ID) {
  await window.ethereum.request({
    method: 'wallet_requestSnaps',
    params: {
      [snapID]: {},
    },
  });
}

/**
 * Get the snap.
 * @param snapID - ID of the snap. Default to the npm lib.
 * @returns Snap - Return the snap.
 */
async function getSnap(snapID = SNAP_ID): Promise<undefined | Snap> {
  const snaps = (await window.ethereum.request({
    method: 'wallet_getSnaps',
  })) as unknown as GetSnapsResponse;
  return Object.values(snaps).find((snap) => snap.id === snapID);
}

export { isFlask, installSnap, getSnap };
