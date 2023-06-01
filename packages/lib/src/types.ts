/*
 * Window type extension to support ethereum
 */

import { MetaMaskInpageProvider } from '@metamask/providers';

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window {
    ethereum: MetaMaskInpageProvider;
  }
}

export type GetSnapsResponse = Record<string, Snap>;

export type GetSnapCasperAccount = {
  publicKey: string;
  error: string;
};

export type GetSnapCasperSign = {
  deploy: string;
  error: string;
};

export type GetSnapCasperSignMessage = {
  signature: string;
  error: string;
};

export type Snap = {
  permissionName: string;
  id: string;
  version: string;
  initialPermissions: Record<string, unknown>;
};
