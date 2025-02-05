import { describe, expect, it } from '@jest/globals';
import { assertIsConfirmationDialog, installSnap } from '@metamask/snaps-jest';
import { Deploy, PublicKey, TransactionV1 } from 'casper-js-sdk';

import {
  fakeContractCallTransactionByHash,
  fakeContractCallTransactionByName,
  fakeModuleBytes,
  fakeModuleBytesTransaction,
  fakeStoredContractByHash,
  fakeStoredContractByName,
  fakeStoredVersionContractByHash,
  fakeStoredVersionContractByName,
  fakeTransfer,
  fakeTransferTransaction,
  fakeTransferWithOptionalTransferId,
  fakeVersionedContractCallTransactionByHash,
  fakeVersionedContractCallTransactionByName,
} from '../test/integration/utils';

/* eslint-disable no-restricted-globals */

/**
 * Test a deploy.
 *
 * @param deploy - JSON string of a deploy.
 */
async function testDeploy(deploy: string) {
  const { request } = await installSnap();
  const resPromise = request({
    method: 'casper_sign',
    params: {
      addressIndex: 0,
      deployJson: deploy,
    },
  });
  const ui = await resPromise.getInterface();
  assertIsConfirmationDialog(ui);
  await ui.ok();
  const result = await resPromise;
  const deployS = (result.response as any).result?.deploy;

  const signedDeploy = Deploy.fromJSON(deployS);
  expect(signedDeploy.validate()).toEqual(true);
}

/**
 * Test a transaction.
 *
 * @param transaction - JSON string of a transaction.
 */
async function testTransaction(transaction: string) {
  const { request } = await installSnap();
  const resPromise = request({
    method: 'casper_sign',
    params: {
      addressIndex: 0,
      transaction,
    },
  });
  const ui = await resPromise.getInterface();
  assertIsConfirmationDialog(ui);
  await ui.ok();
  const result = await resPromise;
  const transactionResult = (result.response as any).result?.transaction;
  const signedTransaction = TransactionV1.fromJSON(transactionResult);
  expect(signedTransaction.validate()).toEqual(true);
}

describe('onRpcRequest', () => {
  it('throws an error if the requested method does not exist', async () => {
    const { request } = await installSnap();

    const response = await request({
      method: 'foo',
    });

    expect(response).toRespondWithError({
      code: -32603,
      message: 'Method not found.',
      stack: expect.any(String),
    });
  });

  it('get cspr account', async () => {
    const { request } = await installSnap();

    const response = await request({
      method: 'casper_getAccount',
    });
    expect(response).toRespondWith({
      publicKey:
        '02025e3cc431e77e52e39e590af36a5dcb7e6ef1e22af86bfd8f022eeea8fccb6740',
    });
  });

  it('get cspr account 0', async () => {
    const { request } = await installSnap();

    const response = await request({
      method: 'casper_getAccount',
      params: {
        addressIndex: 0,
      },
    });
    expect(response).toRespondWith({
      publicKey:
        '02025e3cc431e77e52e39e590af36a5dcb7e6ef1e22af86bfd8f022eeea8fccb6740',
    });
  });

  it('get cspr account derived 1', async () => {
    const { request } = await installSnap();

    const response = await request({
      method: 'casper_getAccount',
      params: {
        addressIndex: 1,
      },
    });
    expect(response).toRespondWith({
      publicKey:
        '02025f8aa8213534eb9acc9cbd3d464cd4990e4dd90f1e6a957cddedfc3b5d21ca42',
    });
  });

  it('get cspr account derived -1', async () => {
    const { request } = await installSnap();

    const response = await request({
      method: 'casper_getAccount',
      params: {
        addressIndex: -1,
      },
    });
    expect(response).toRespondWithError({
      code: -32603,
      message: 'Invalid BIP-32 index: Must be a non-negative integer.',
      stack: expect.any(String),
    });
  });

  it('get cspr account derived random', async () => {
    const { request } = await installSnap();

    const response = await request({
      method: 'casper_getAccount',
      params: {
        addressIndex: 'test',
      },
    });
    expect(response).toRespondWithError({
      code: -32603,
      message: 'Invalid BIP-32 index: Must be a non-negative integer.',
      stack: expect.any(String),
    });
  });

  it('test fake transfer deploy', async () => {
    await testDeploy(
      Deploy.toJSON(
        fakeTransfer(
          '02025e3cc431e77e52e39e590af36a5dcb7e6ef1e22af86bfd8f022eeea8fccb6740',
        ),
      ) as string,
    );
  });

  it('test fake transfer with optional id deploy', async () => {
    await testDeploy(
      Deploy.toJSON(
        fakeTransferWithOptionalTransferId(
          '02025e3cc431e77e52e39e590af36a5dcb7e6ef1e22af86bfd8f022eeea8fccb6740',
        ),
      ) as string,
    );
  });

  it('test fake module byte deploy', async () => {
    await testDeploy(
      Deploy.toJSON(
        fakeModuleBytes(
          '02025e3cc431e77e52e39e590af36a5dcb7e6ef1e22af86bfd8f022eeea8fccb6740',
        ),
      ) as string,
    );
  });

  it('test fake stored contract by name deploy', async () => {
    await testDeploy(
      Deploy.toJSON(
        fakeStoredContractByName(
          '02025e3cc431e77e52e39e590af36a5dcb7e6ef1e22af86bfd8f022eeea8fccb6740',
        ),
      ) as string,
    );
  });

  it('test fake stored contract by hash deploy', async () => {
    await testDeploy(
      Deploy.toJSON(
        fakeStoredContractByHash(
          '02025e3cc431e77e52e39e590af36a5dcb7e6ef1e22af86bfd8f022eeea8fccb6740',
        ),
      ) as string,
    );
  });

  it('test fake stored version contract by name deploy', async () => {
    await testDeploy(
      Deploy.toJSON(
        fakeStoredVersionContractByName(
          '02025e3cc431e77e52e39e590af36a5dcb7e6ef1e22af86bfd8f022eeea8fccb6740',
        ),
      ) as string,
    );
  });

  it('test fake stored version contract by hash deploy', async () => {
    await testDeploy(
      Deploy.toJSON(
        fakeStoredVersionContractByHash(
          '02025e3cc431e77e52e39e590af36a5dcb7e6ef1e22af86bfd8f022eeea8fccb6740',
        ),
      ) as string,
    );
  });

  it('test fake transfer transaction', async () => {
    await testTransaction(
      TransactionV1.toJSON(
        fakeTransferTransaction(
          '02025e3cc431e77e52e39e590af36a5dcb7e6ef1e22af86bfd8f022eeea8fccb6740',
        ) as TransactionV1,
      ) as string,
    );
  });

  it('test fake module byte transaction', async () => {
    await testTransaction(
      TransactionV1.toJSON(
        fakeModuleBytesTransaction(
          '02025e3cc431e77e52e39e590af36a5dcb7e6ef1e22af86bfd8f022eeea8fccb6740',
        ) as TransactionV1,
      ) as string,
    );
  });

  it('test fake stored contract by name transaction', async () => {
    await testTransaction(
      TransactionV1.toJSON(
        fakeContractCallTransactionByName(
          '02025e3cc431e77e52e39e590af36a5dcb7e6ef1e22af86bfd8f022eeea8fccb6740',
        ) as TransactionV1,
      ) as string,
    );
  });

  it('test fake stored contract by hash transaction', async () => {
    await testTransaction(
      TransactionV1.toJSON(
        fakeContractCallTransactionByHash(
          '02025e3cc431e77e52e39e590af36a5dcb7e6ef1e22af86bfd8f022eeea8fccb6740',
        ) as TransactionV1,
      ) as string,
    );
  });

  it('test fake stored version contract by name transaction', async () => {
    await testTransaction(
      TransactionV1.toJSON(
        fakeVersionedContractCallTransactionByName(
          '02025e3cc431e77e52e39e590af36a5dcb7e6ef1e22af86bfd8f022eeea8fccb6740',
        ) as TransactionV1,
      ) as string,
    );
  });

  it('test fake stored version contract by hash transaction', async () => {
    await testTransaction(
      TransactionV1.toJSON(
        fakeVersionedContractCallTransactionByHash(
          '02025e3cc431e77e52e39e590af36a5dcb7e6ef1e22af86bfd8f022eeea8fccb6740',
        ) as TransactionV1,
      ) as string,
    );
  });

  it('Signing a deploy without proper parameters should cause an error', async () => {
    const { request } = await installSnap();
    let resPromise = await request({
      method: 'casper_sign',
    });
    expect(resPromise.response).toEqual({
      result: {
        error:
          "Unable to convert json into deploy object. Details : The JSON can't be parsed as a Transaction.",
      },
    });

    resPromise = await request({
      method: 'casper_sign',
      params: {
        addressIndex: 0,
      },
    });
    expect(resPromise.response).toEqual({
      result: {
        error:
          "Unable to convert json into deploy object. Details : The JSON can't be parsed as a Transaction.",
      },
    });

    resPromise = await request({
      method: 'casper_sign',
      params: {
        deployJson: -1,
      },
    });
    expect(resPromise.response).toEqual({
      result: {
        error:
          "Unable to convert json into deploy object. Details : The JSON can't be parsed as a Transaction.",
      },
    });

    resPromise = await request({
      method: 'casper_sign',
      params: {
        deployJson: -1,
        transaction: -1,
      },
    });
    expect(resPromise.response).toEqual({
      result: {
        error:
          'Only deployJson field or transaction field should be populated not both.',
      },
    });

    resPromise = await request({
      method: 'casper_sign',
      params: {
        deployJson: '-1',
        addressIndex: 0,
      },
    });
    expect(resPromise.response).toEqual({
      result: {
        error:
          "Unable to convert json into deploy object. Details : The JSON can't be parsed as a Transaction.",
      },
    });

    resPromise = await request({
      method: 'casper_sign',
      params: {
        addressIndex: -1,
      },
    });
    expect((resPromise.response as any).error.message).toEqual(
      'Invalid BIP-32 index: Must be a non-negative integer.',
    );

    resPromise = await request({
      method: 'casper_sign',
      params: {
        deployJson: -1,
        addressIndex: -1,
      },
    });
    expect((resPromise.response as any).error.message).toEqual(
      'Invalid BIP-32 index: Must be a non-negative integer.',
    );

    resPromise = await request({
      method: 'casper_sign',
      params: {
        deployJson: '-1',
        addressIndex: -1,
      },
    });
    expect((resPromise.response as any).error.message).toEqual(
      'Invalid BIP-32 index: Must be a non-negative integer.',
    );
  });

  it('Rejecting a signing popup should return false', async () => {
    const { request } = await installSnap();
    const resPromise = request({
      method: 'casper_sign',
      params: {
        addressIndex: 0,
        deployJson: Deploy.toJSON(
          fakeTransfer(
            '02025e3cc431e77e52e39e590af36a5dcb7e6ef1e22af86bfd8f022eeea8fccb6740',
          ),
        ) as any,
      },
    });
    const ui = await resPromise.getInterface();
    assertIsConfirmationDialog(ui);
    await ui.cancel();
    const result = await resPromise;
    expect(result.response).toEqual({ result: false });
  });

  it('Signing a message should return a valid signature', async () => {
    const { request } = await installSnap();
    const message = 'test';
    const resPromise = request({
      method: 'casper_signMessage',
      params: {
        message,
      },
    });
    const ui = await resPromise.getInterface();
    assertIsConfirmationDialog(ui);
    await ui.ok();
    const result = await resPromise;
    expect(result.response).toEqual({
      result: {
        signature:
          '025a95ef70c74994007e846a3c76e02d2163efdc4e4388f795f7186c8408db19af74c2fd7d2729e6a2f55e5d23530d8722a111a2594beb60bf9ad29614122789d5',
      },
    });
    const pk = PublicKey.fromHex(
      '02025e3cc431e77e52e39e590af36a5dcb7e6ef1e22af86bfd8f022eeea8fccb6740',
    );
    const messageBytes = Uint8Array.from(
      Buffer.from(`Casper Message:\n${message}`),
    );
    const msgSignature = Buffer.from(
      (result.response as any).result.signature,
      'hex',
    );
    expect(pk.verifySignature(messageBytes, msgSignature)).toEqual(true);
  });

  it('Rejecting a message signing popup should return false', async () => {
    const { request } = await installSnap();
    const resPromise = request({
      method: 'casper_signMessage',
      params: {
        message: 'test',
      },
    });
    const ui = await resPromise.getInterface();
    assertIsConfirmationDialog(ui);
    await ui.cancel();
    const result = await resPromise;
    expect(result.response).toEqual({ result: false });
  });
});
