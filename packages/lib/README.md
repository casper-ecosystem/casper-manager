# Casper Snap Helper

Casper Snap helper is used to install Casper snap and expose API toward snap.

## Usage

```typescript
// Check if MetaMask flask is installed
import {
  getAccount,
  getSnap,
  installSnap,
  signDeploy,
  signMessage,
  signTransaction,
} from 'casper-manager-helper';

import {
  PublicKey,
  DeployHeader,
  Timestamp,
  Duration,
  ExecutableDeployItem,
  TransferDeployItem,
  Deploy,
  NativeTransferBuilder,
  TransactionV1,
} from 'casper-js-sdk';

// Get Casper Snap to check if it's installed
const casperSnap = await getSnap();
// If Casper Snap isn't installed, intall it.
if (!casperSnap) {
  await installSnap();
}

const address = await getAccount(); // Same as getAccount(0);

console.log(`Snap installed, account generated with address: ${address}`);

const header = new DeployHeader(
  'casper',
  [],
  1,
  new Timestamp(new Date()),
  new Duration(3600000),
);
header.account = address;

const session = new ExecutableDeployItem();
session.transfer = TransferDeployItem.newTransfer(
  '100000000000',
  PublicKey.fromHex(
    '0168e3a352e7bab76c85fb77f7c641d77096dae55845c79655522c24e9cc1ffe22',
  ),
  undefined,
  0,
);

const transfer = Deploy.makeDeploy(
  header,
  ExecutableDeployItem.standardPayment('1'),
  session,
);

const signedTransfer = await signDeploy(transfer, {
  addressIndex: 0,
});

console.log(Deploy.toJSON(signedTransfer));

const transferTransaction = new NativeTransferBuilder()
  .from(address)
  .target(
    PublicKey.fromHex(
      '0168e3a352e7bab76c85fb77f7c641d77096dae55845c79655522c24e9cc1ffe22',
    ),
  )
  .amount('25000000000') // Amount in motes
  .id(Date.now())
  .chainName('casper-net-1')
  .payment(100_000_000)
  .build()
  .getTransactionV1();

const signedTransferTransaction = await signTransaction(transferTransaction, {
  addressIndex: 0,
});

console.log(TransactionV1.toJSON(signedTransferTransaction));

const signedMessage = signMessage('Hello world', {
  addressIndex: 0,
});

console.log(signedMessage);
```
