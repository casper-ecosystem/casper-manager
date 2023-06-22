import {
  CLBool,
  CLBoolType,
  CLByteArray,
  CLI32,
  CLI64,
  CLKey,
  CLList,
  CLMap,
  CLOption,
  CLPublicKey,
  CLResult,
  CLString,
  CLStringType,
  CLTuple1,
  CLTuple2,
  CLTuple3,
  CLU128,
  CLU256,
  CLU32,
  CLU512,
  CLU64,
  CLU8,
  CLU8Type,
  CLUnit,
  CLURef,
  DeployUtil,
  RuntimeArgs,
} from 'casper-js-sdk';
import { Err, None, Ok, Some } from 'ts-results';

const clbool = new CLBool(false);
const i32 = new CLI32(0);
const i64 = new CLI64(0);
const u8 = new CLU8(0);
const u32 = new CLU32(0);
const u64 = new CLU64(0);
const u128 = new CLU128(0);
const u256 = new CLU256(0);
const u512 = new CLU512(0);
const unit = new CLUnit();
const clstring = new CLString('test');
const key = new CLKey(
  CLPublicKey.fromHex(
    '0168e3a352e7bab76c85fb77f7c641d77096dae55845c79655522c24e9cc1ffe21',
  ),
);
const uref = CLURef.fromFormattedStr(
  'uref-ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff-007',
);
const optionNone = new CLOption(None, new CLBoolType());
const optionSome = new CLOption(Some(new CLString('test')), new CLStringType());
const list = new CLList([clstring]);
const bytearray = new CLByteArray(new Uint8Array([21, 31]));
// eslint-disable-next-line id-denylist
const myTypes = { ok: new CLBoolType(), err: new CLU8Type() };
const myOkRes = new CLResult(Ok(new CLBool(true)), myTypes);
const myErrRes = new CLResult(Err(new CLU8(1)), myTypes);
const map = new CLMap([[new CLBool(true), new CLBool(false)]]);
const myTup1 = new CLTuple1([new CLBool(true)]);
const myTup2 = new CLTuple2([new CLBool(false), new CLI32(-555)]);
const myTup3 = new CLTuple3([
  new CLI32(-555),
  new CLString('ABC'),
  new CLString('XYZ'),
]);
const publicKey = CLPublicKey.fromHex(
  '0168e3a352e7bab76c85fb77f7c641d77096dae55845c79655522c24e9cc1ffe21',
);

const CLValues = {
  clbool,
  i32,
  i64,
  u8,
  u32,
  u64,
  u128,
  u256,
  u512,
  unit,
  clstring,
  key,
  uref,
  optionNone,
  optionSome,
  list,
  bytearray,
  myOkRes,
  myErrRes,
  map,
  myTup1,
  myTup2,
  myTup3,
  publicKey,
};

/**
 * Fake transfer.
 * @param pk - Public key hex.
 * @returns A deploy.
 */
function fakeTransfer(pk: string) {
  return DeployUtil.makeDeploy(
    new DeployUtil.DeployParams(CLPublicKey.fromHex(pk), 'casper', 1, 3600000),
    DeployUtil.ExecutableDeployItem.newTransfer(
      1,
      CLPublicKey.fromHex(
        '0168e3a352e7bab76c85fb77f7c641d77096dae55845c79655522c24e9cc1ffe22',
      ),
      undefined,
      0,
    ),
    DeployUtil.standardPayment(1),
  );
}

/**
 * Fake transfer with optional ID.
 * @param pk - Public key hex.
 * @returns A deploy.
 */
function fakeTransferWithOptionalTransferId(pk: string) {
  return DeployUtil.makeDeploy(
    new DeployUtil.DeployParams(CLPublicKey.fromHex(pk), 'casper', 1, 3600000),
    DeployUtil.ExecutableDeployItem.newTransferWithOptionalTransferId(
      1,
      CLPublicKey.fromHex(
        '0168e3a352e7bab76c85fb77f7c641d77096dae55845c79655522c24e9cc1ffe22',
      ),
    ),
    DeployUtil.standardPayment(1),
  );
}

/**
 * Fake module bytes deploy.
 * @param pk - Public key hex.
 * @returns A deploy.
 */
function fakeModuleBytes(pk: string) {
  return DeployUtil.makeDeploy(
    new DeployUtil.DeployParams(CLPublicKey.fromHex(pk), 'casper', 1, 3600000),
    DeployUtil.ExecutableDeployItem.newModuleBytes(
      new Uint8Array([0]),
      RuntimeArgs.fromMap(CLValues),
    ),
    DeployUtil.standardPayment(1),
  );
}

/**
 * Fake stored contract by name deploy.
 * @param pk - Public key hex.
 * @returns A deploy.
 */
function fakeStoredContractByName(pk: string) {
  return DeployUtil.makeDeploy(
    new DeployUtil.DeployParams(CLPublicKey.fromHex(pk), 'casper', 1, 3600000),
    DeployUtil.ExecutableDeployItem.newStoredContractByName(
      'test',
      'test',
      RuntimeArgs.fromMap(CLValues),
    ),
    DeployUtil.standardPayment(1),
  );
}

/**
 * Fake stored contract by hash deploy.
 * @param pk - Public key hex.
 * @returns A deploy.
 */
function fakeStoredContractByHash(pk: string) {
  return DeployUtil.makeDeploy(
    new DeployUtil.DeployParams(CLPublicKey.fromHex(pk), 'casper', 1, 3600000),
    DeployUtil.ExecutableDeployItem.newStoredContractByHash(
      Uint8Array.from(Buffer.from('test', 'hex')),
      'test',
      RuntimeArgs.fromMap(CLValues),
    ),
    DeployUtil.standardPayment(1),
  );
}

/**
 * Fake stored version contract by name deploy.
 * @param pk - Public key hex.
 * @returns A deploy.
 */
function fakeStoredVersionContractByName(pk: string) {
  return DeployUtil.makeDeploy(
    new DeployUtil.DeployParams(CLPublicKey.fromHex(pk), 'casper', 1, 3600000),
    DeployUtil.ExecutableDeployItem.newStoredVersionContractByName(
      'test',
      null,
      'test',
      RuntimeArgs.fromMap(CLValues),
    ),
    DeployUtil.standardPayment(1),
  );
}

/**
 * Fake stored version contract by hash deploy.
 * @param pk - Public key hex.
 * @returns A deploy.
 */
function fakeStoredVersionContractByHash(pk: string) {
  return DeployUtil.makeDeploy(
    new DeployUtil.DeployParams(CLPublicKey.fromHex(pk), 'casper', 1, 3600000),
    DeployUtil.ExecutableDeployItem.newStoredVersionContractByHash(
      Uint8Array.from(Buffer.from('test', 'hex')),
      null,
      'test',
      RuntimeArgs.fromMap(CLValues),
    ),
    DeployUtil.standardPayment(1),
  );
}

export {
  fakeTransfer,
  fakeTransferWithOptionalTransferId,
  fakeModuleBytes,
  fakeStoredContractByName,
  fakeStoredContractByHash,
  fakeStoredVersionContractByName,
  fakeStoredVersionContractByHash,
};
