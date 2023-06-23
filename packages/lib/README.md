# Casper Snap Helper

Casper Snap helper is used to install Casper snap and expose API toward snap.

## Usage

```typescript
// Check if MetaMask flask is installed
import {
  getAccount,
  getSnap,
  installSnap,
  isFlask,
  signDeploy,
  signMessage,
} from 'casper-manager-helper';
import { CLPublicKey, DeployUtil, motesToCSPR } from 'casper-js-sdk';

const flask = await isFlask();
if (flask) {
  // Get Casper Snap to check if it's installed
  const casperSnap = await getSnap();
  // If Casper Snap isn't installed, intall it.
  if (!casperSnap) {
    await installSnap();
  }
  const address = await getAccount(); // Same as getAccount(0);
  const address2 = await getAccount(1);
  console.log(`Snap installed, account generated with address: ${address}`);
  const transfer = DeployUtil.makeDeploy(
    new DeployUtil.DeployParams(
      CLPublicKey.fromHex(address),
      'casper-test',
      1,
      3600000,
    ),
    DeployUtil.ExecutableDeployItem.newTransfer(
      motesToCSPR(3),
      CLPublicKey.fromHex(address2),
      undefined,
      '0',
    ),
    DeployUtil.standardPayment(100000000),
  );
  const signedTransfer = signDeploy(transfer, {
    addressIndex: 0,
  });
  console.log(DeployUtil.deployToJson(signedTransfer));
  const signedMessage = signMessage('Hello world', {
    addressIndex: 0,
  });
  console.log(signedMessage);
}
```
