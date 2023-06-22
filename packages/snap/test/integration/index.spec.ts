import {
  Dappeteer,
  DappeteerBrowser,
  DappeteerPage,
  initSnapEnv,
} from '@chainsafe/dappeteer';
import { CLPublicKey, DeployUtil } from 'casper-js-sdk';
// eslint-disable-next-line import/no-nodejs-modules
import { exec } from 'child_process';

import {
  fakeModuleBytes,
  fakeStoredContractByHash,
  fakeStoredContractByName,
  fakeStoredVersionContractByHash,
  fakeStoredVersionContractByName,
  fakeTransfer,
  fakeTransferWithOptionalTransferId,
} from './utils';

const DAPP_PAGE = 'http://example.org';

/**
 * Build snap.
 * @returns String - Path to builded snap.
 */
async function buildSnap(): Promise<string> {
  console.log(`Building my-snap...`);
  await new Promise((resolve, reject) => {
    exec(`cd ../.. && yarn build`, (error, stdout) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(stdout);
    });
  });

  return '../..';
}

/**
 * Test a deploy.
 * @param connectedPage - Connected page.
 * @param snapId - Snap ID.
 * @param metaMask - Metamask Instance.
 * @param deploy - JSON string of a deploy.
 */
async function testDeploy(
  connectedPage: DappeteerPage,
  snapId: string,
  metaMask: Dappeteer,
  deploy: string,
) {
  const resPromise = metaMask.snaps.invokeSnap(
    connectedPage,
    snapId,
    'casper_sign',
    {
      deployJson: deploy,
      addressIndex: 0,
    },
  );
  await metaMask.snaps.dialog.accept();
  const res = (await resPromise) as any;
  const signedDeploy = DeployUtil.deployFromJson(res.deploy).val;
  expect(signedDeploy).toBeInstanceOf(DeployUtil.Deploy);
  const validateDeploy = DeployUtil.validateDeploy(
    signedDeploy as DeployUtil.Deploy,
  ).ok;
  expect(validateDeploy).toEqual(true);
}

describe('snap', function () {
  let metaMask: Dappeteer;
  let browser: DappeteerBrowser;
  let connectedPage: DappeteerPage;
  let snapId: string;

  beforeAll(async function () {
    await buildSnap();
    ({ metaMask, snapId, browser } = await initSnapEnv({
      snapIdOrLocation: '.',
      headless: true,
      metaMaskFlask: true,
    }));

    connectedPage = await metaMask.page.browser().newPage();
    await connectedPage.goto(DAPP_PAGE);
  });

  afterAll(async function () {
    await browser.close();
  });

  test('Getting an account without params should be the same key as 0.', async function () {
    const resultPromise = metaMask.snaps.invokeSnap(
      connectedPage,
      snapId,
      'casper_getAccount',
    );
    const result = (await resultPromise) as any;
    expect(result.publicKey).toEqual(
      CLPublicKey.fromHex(result.publicKey).toHex(),
    );
    expect(result).toBeTruthy();
    const resultPromiseWithParam = metaMask.snaps.invokeSnap(
      connectedPage,
      snapId,
      'casper_getAccount',
      {
        addressIndex: 0,
      },
    );
    const resultWithParam = (await resultPromiseWithParam) as any;

    expect(resultWithParam.publicKey).toEqual(
      CLPublicKey.fromHex(resultWithParam.publicKey).toHex(),
    );
    expect(resultWithParam).toBeTruthy();
    expect(resultWithParam.publicKey).toEqual(result.publicKey);

    const resultPromiseOther = metaMask.snaps.invokeSnap(
      connectedPage,
      snapId,
      'casper_getAccount',
      {
        addressIndex: 1,
      },
    );
    const resultOther = (await resultPromiseOther) as any;
    expect(resultOther.publicKey).toEqual(
      CLPublicKey.fromHex(resultOther.publicKey).toHex(),
    );
    expect(resultOther).toBeTruthy();
    expect(resultWithParam.publicKey).not.toEqual(resultOther.publicKey);
  });

  test('Getting a account with a negative index should cause an error', async function () {
    try {
      await metaMask.snaps.invokeSnap(
        connectedPage,
        snapId,
        'casper_getAccount',
        {
          addressIndex: -1,
        },
      );
    } catch (error) {
      expect(error.message).toContain(
        'Invalid BIP-32 index: Must be a non-negative integer',
      );
    }
  });

  test('Getting a account with something else than a number should cause an error', async function () {
    try {
      await metaMask.snaps.invokeSnap(
        connectedPage,
        snapId,
        'casper_getAccount',
        {
          addressIndex: 'qfqzdfqzd',
        },
      );
    } catch (error) {
      expect(error.message).toContain(
        'Invalid BIP-32 index: Must be a non-negative integer',
      );
    }
  });

  test('Signing a deploy without proper parameters should cause an error', async function () {
    try {
      await metaMask.snaps.invokeSnap(connectedPage, snapId, 'casper_sign');
      fail('it should not reach here');
    } catch (error) {
      expect(error.message).toContain('Cannot read properties of undefined');
    }

    try {
      await metaMask.snaps.invokeSnap(connectedPage, snapId, 'casper_sign', {
        addressIndex: 0,
      });
      fail('it should not reach here');
    } catch (error) {
      expect(error.message).toContain('Cannot read properties of undefined');
    }

    try {
      await metaMask.snaps.invokeSnap(connectedPage, snapId, 'casper_sign', {
        addressIndex: -1,
      });
      fail('it should not reach here');
    } catch (error) {
      expect(error.message).toContain(
        'Invalid BIP-32 index: Must be a non-negative integer.',
      );
    }

    try {
      await metaMask.snaps.invokeSnap(connectedPage, snapId, 'casper_sign', {
        deployJson: -1,
        addressIndex: -1,
      });
      fail('it should not reach here');
    } catch (error) {
      expect(error.message).toContain(
        'Invalid BIP-32 index: Must be a non-negative integer.',
      );
    }

    try {
      await metaMask.snaps.invokeSnap(connectedPage, snapId, 'casper_sign', {
        deployJson: '-1',
        addressIndex: -1,
      });
      fail('it should not reach here');
    } catch (error) {
      expect(error.message).toContain(
        'Invalid BIP-32 index: Must be a non-negative integer.',
      );
    }
    let res;
    res = await metaMask.snaps.invokeSnap(
      connectedPage,
      snapId,
      'casper_sign',
      {
        deployJson: -1,
      },
    );

    expect((res as any).error).toEqual(
      'Unable to convert json into deploy object.',
    );

    res = await metaMask.snaps.invokeSnap(
      connectedPage,
      snapId,
      'casper_sign',
      {
        deployJson: '-1',
        addressIndex: 0,
      },
    );

    expect((res as any).error).toEqual(
      'Unable to convert json into deploy object.',
    );
  });

  test('Rejecting a signing popup should return false', async function () {
    const result = (await metaMask.snaps.invokeSnap(
      connectedPage,
      snapId,
      'casper_getAccount',
    )) as any;
    const deploy = DeployUtil.deployToJson(fakeTransfer(result.publicKey));
    const resPromise = metaMask.snaps.invokeSnap(
      connectedPage,
      snapId,
      'casper_sign',
      {
        deployJson: deploy as unknown as string,
        addressIndex: 0,
      },
    );
    await metaMask.snaps.dialog.reject();
    const res = await resPromise;
    expect(res).toEqual(false);
  });

  test('Accepting a signing popup for a transfer should succeed', async function () {
    const result = (await metaMask.snaps.invokeSnap(
      connectedPage,
      snapId,
      'casper_getAccount',
    )) as any;
    const deploy = DeployUtil.deployToJson(fakeTransfer(result.publicKey));
    await testDeploy(
      connectedPage,
      snapId,
      metaMask,
      deploy as unknown as string,
    );
  });

  test('Accepting a signing popup for a transfer with optional transfer id should succeed', async function () {
    const result = (await metaMask.snaps.invokeSnap(
      connectedPage,
      snapId,
      'casper_getAccount',
    )) as any;
    const deploy = DeployUtil.deployToJson(
      fakeTransferWithOptionalTransferId(result.publicKey),
    );

    await testDeploy(
      connectedPage,
      snapId,
      metaMask,
      deploy as unknown as string,
    );
  });

  test('Accepting a signing popup for a module bytes deploy should succeed', async function () {
    const result = (await metaMask.snaps.invokeSnap(
      connectedPage,
      snapId,
      'casper_getAccount',
    )) as any;
    const deploy = DeployUtil.deployToJson(fakeModuleBytes(result.publicKey));
    await testDeploy(
      connectedPage,
      snapId,
      metaMask,
      deploy as unknown as string,
    );
  });

  test('Accepting a signing popup for a stored contract by name deploy should succeed', async function () {
    const result = (await metaMask.snaps.invokeSnap(
      connectedPage,
      snapId,
      'casper_getAccount',
    )) as any;
    const deploy = DeployUtil.deployToJson(
      fakeStoredContractByName(result.publicKey),
    );
    await testDeploy(
      connectedPage,
      snapId,
      metaMask,
      deploy as unknown as string,
    );
  });

  test('Accepting a signing popup for a stored contract by hash deploy should succeed', async function () {
    const result = (await metaMask.snaps.invokeSnap(
      connectedPage,
      snapId,
      'casper_getAccount',
    )) as any;
    const deploy = DeployUtil.deployToJson(
      fakeStoredContractByHash(result.publicKey),
    );
    await testDeploy(
      connectedPage,
      snapId,
      metaMask,
      deploy as unknown as string,
    );
  });

  test('Accepting a signing popup for a stored version contract by name deploy should succeed', async function () {
    const result = (await metaMask.snaps.invokeSnap(
      connectedPage,
      snapId,
      'casper_getAccount',
    )) as any;
    const deploy = DeployUtil.deployToJson(
      fakeStoredVersionContractByName(result.publicKey),
    );
    await testDeploy(
      connectedPage,
      snapId,
      metaMask,
      deploy as unknown as string,
    );
  });

  test('Accepting a signing popup for a stored version contract by hash deploy should succeed', async function () {
    const result = (await metaMask.snaps.invokeSnap(
      connectedPage,
      snapId,
      'casper_getAccount',
    )) as any;
    const deploy = DeployUtil.deployToJson(
      fakeStoredVersionContractByHash(result.publicKey),
    );
    await testDeploy(
      connectedPage,
      snapId,
      metaMask,
      deploy as unknown as string,
    );
  });

  test('snap invoke should error on non supported method', async function () {
    try {
      await metaMask.snaps.invokeSnap(connectedPage, snapId, 'invalid');
    } catch (error) {
      expect(error.message).toContain('Method not found.');
    }
  });
});
