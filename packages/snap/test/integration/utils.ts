import {
  Args,
  CLTypeBool,
  CLTypeByteArray,
  CLTypeInt32,
  CLTypeInt64,
  CLTypeList,
  CLTypeMap,
  CLTypeOption,
  CLTypePublicKey,
  CLTypeResult,
  CLTypeString,
  CLTypeTuple1,
  CLTypeTuple2,
  CLTypeTuple3,
  CLTypeUInt128,
  CLTypeUInt256,
  CLTypeUInt32,
  CLTypeUInt512,
  CLTypeUInt64,
  CLTypeUInt8,
  CLTypeUnit,
  CLTypeUref,
  CLValue,
  CLValueBool,
  CLValueByteArray,
  CLValueInt32,
  CLValueInt64,
  CLValueList,
  CLValueMap,
  CLValueOption,
  CLValueString,
  CLValueTuple1,
  CLValueTuple2,
  CLValueTuple3,
  CLValueUInt128,
  CLValueUInt256,
  CLValueUInt32,
  CLValueUInt512,
  CLValueUInt64,
  CLValueUInt8,
  CLValueUnit,
  ContractHash,
  Deploy,
  DeployHeader,
  Duration,
  ExecutableDeployItem,
  Key,
  PublicKey,
  StoredContractByHash,
  StoredContractByName,
  StoredVersionedContractByHash,
  StoredVersionedContractByName,
  Timestamp,
  TransferDeployItem,
  URef,
  CLValueResult,
  NativeTransferBuilder,
  ContractCallBuilder,
  SessionBuilder,
} from 'casper-js-sdk';

const clboolfalse = new CLValue(CLTypeBool);
clboolfalse.bool = new CLValueBool(false);

const clbooltrue = new CLValue(CLTypeBool);
clbooltrue.bool = new CLValueBool(true);

const i32 = new CLValue(CLTypeInt32);
i32.i32 = new CLValueInt32(0);

const i64 = new CLValue(CLTypeInt64);
i64.i64 = new CLValueInt64(0);

const u8 = new CLValue(CLTypeUInt8);
u8.ui8 = new CLValueUInt8(0);

const u32 = new CLValue(CLTypeUInt32);
u32.ui32 = new CLValueUInt32(0);

const u64 = new CLValue(CLTypeUInt64);
u64.ui64 = new CLValueUInt64(0);

const u128 = new CLValue(CLTypeUInt128);
u128.ui128 = new CLValueUInt128(0);

const u256 = new CLValue(CLTypeUInt256);
u256.ui256 = new CLValueUInt256(0);

const u512 = new CLValue(CLTypeUInt512);
u512.ui512 = new CLValueUInt512(0);

const unit = new CLValue(CLTypeUnit);
unit.unit = new CLValueUnit();
const key = CLValue.newCLKey(
  Key.newKey(
    'b065858b79372202c489a5d3e1ae0e3fae9a8d12f3c3e5507579702e1817c88b',
  ),
);
const uref = new CLValue(CLTypeUref);
uref.uref = URef.fromString(
  'uref-ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff-007',
);

const clstring = new CLValue(CLTypeString);
clstring.stringVal = new CLValueString('test');

const clu81 = new CLValue(CLTypeUInt8);
clu81.ui8 = new CLValueUInt8(1);

const clu32555 = new CLValue(CLTypeUInt32);
clu32555.ui32 = new CLValueUInt32(555);

const clstringabc = new CLValue(CLTypeString);
clstringabc.stringVal = new CLValueString('ABC');

const clstringxyz = new CLValue(CLTypeString);
clstringxyz.stringVal = new CLValueString('XYZ');

const optionNone = new CLValue(new CLTypeOption(CLTypeBool));
optionNone.option = new CLValueOption(null, new CLTypeOption(CLTypeBool));

const optionSome = new CLValue(new CLTypeOption(CLTypeString));
optionSome.option = new CLValueOption(clstring, new CLTypeOption(CLTypeString));

const list = new CLValue(new CLTypeList(CLTypeString));
list.list = new CLValueList(new CLTypeList(CLTypeString), [clstring]);

const bytearray = new CLValue(new CLTypeByteArray(2));
bytearray.byteArray = new CLValueByteArray(new Uint8Array([21, 31]));

const myOkRes = new CLValue(new CLTypeResult(CLTypeBool, CLTypeUInt8));
myOkRes.result = new CLValueResult(
  new CLTypeResult(CLTypeBool, CLTypeUInt8),
  true,
  clbooltrue,
);

const myErrRes = new CLValue(new CLTypeResult(CLTypeBool, CLTypeUInt8));
myErrRes.result = new CLValueResult(
  new CLTypeResult(CLTypeBool, CLTypeUInt8),
  false,
  clu81,
);

const mapType = new CLTypeMap(CLTypeString, CLTypeString);
const map = new CLValue(mapType);
map.map = new CLValueMap(mapType);
map.map?.append(
  CLValue.newCLString('keyTest'),
  CLValue.newCLString('valueTest'),
);

const myTup1 = new CLValue(new CLTypeTuple1(CLTypeBool));
myTup1.tuple1 = new CLValueTuple1(new CLTypeTuple1(CLTypeBool), clboolfalse);

const myTup2 = new CLValue(new CLTypeTuple2(CLTypeBool, CLTypeUInt32));
myTup2.tuple2 = new CLValueTuple2(
  new CLTypeTuple2(CLTypeBool, CLTypeUInt32),
  clboolfalse,
  clu32555,
);

const myTup3 = new CLValue(
  new CLTypeTuple3(CLTypeUInt32, CLTypeString, CLTypeString),
);
myTup3.tuple3 = new CLValueTuple3(
  new CLTypeTuple3(CLTypeUInt32, CLTypeString, CLTypeString),
  clu32555,
  clstringabc,
  clstringxyz,
);

const publicKey = new CLValue(CLTypePublicKey);
publicKey.publicKey = PublicKey.fromHex(
  '0168e3a352e7bab76c85fb77f7c641d77096dae55845c79655522c24e9cc1ffe21',
);

const CLValues = {
  clboolfalse,
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
  bytearray,
  list,
  map,
  myOkRes,
  myErrRes,
  myTup1,
  myTup2,
  myTup3,
  publicKey,
};

/**
 * Fake transfer.
 *
 * @param pk - Public key hex.
 * @returns A deploy.
 */
function fakeTransfer(pk: string) {
  const header = new DeployHeader(
    'casper',
    [],
    1,
    new Timestamp(new Date()),
    new Duration(3600000),
  );
  header.account = PublicKey.fromHex(pk);

  const session = new ExecutableDeployItem();
  session.transfer = TransferDeployItem.newTransfer(
    '1',
    PublicKey.fromHex(
      '0168e3a352e7bab76c85fb77f7c641d77096dae55845c79655522c24e9cc1ffe22',
    ),
    undefined,
    0,
  );

  return Deploy.makeDeploy(
    header,
    ExecutableDeployItem.standardPayment('1'),
    session,
  );
}

/**
 * Fake transfer transaction.
 *
 * @param pk - Public key hex.
 * @returns A transaction V1.
 */
function fakeTransferTransaction(pk: string) {
  return new NativeTransferBuilder()
    .from(PublicKey.fromHex(pk))
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
}

/**
 * Fake transfer with optional ID.
 *
 * @param pk - Public key hex.
 * @returns A deploy.
 */
function fakeTransferWithOptionalTransferId(pk: string) {
  const header = new DeployHeader(
    'casper',
    [],
    1,
    new Timestamp(new Date()),
    new Duration(3600000),
  );
  header.account = PublicKey.fromHex(pk);

  const session = new ExecutableDeployItem();
  session.transfer = TransferDeployItem.newTransfer(
    '1',
    PublicKey.fromHex(
      '0168e3a352e7bab76c85fb77f7c641d77096dae55845c79655522c24e9cc1ffe22',
    ),
  );

  return Deploy.makeDeploy(
    header,
    ExecutableDeployItem.standardPayment('1'),
    session,
  );
}

/**
 * Fake module bytes deploy.
 *
 * @param pk - Public key hex.
 * @returns A deploy.
 */
function fakeModuleBytes(pk: string) {
  const header = new DeployHeader(
    'casper',
    [],
    1,
    new Timestamp(new Date()),
    new Duration(3600000),
  );
  header.account = PublicKey.fromHex(pk);

  return Deploy.makeDeploy(
    header,
    ExecutableDeployItem.standardPayment('1'),
    ExecutableDeployItem.newModuleBytes(
      new Uint8Array([0]),
      Args.fromMap(CLValues),
    ),
  );
}

/**
 * Fake module bytes transaction.
 *
 * @param pk - Public key hex.
 * @returns A transaction V1.
 */
function fakeModuleBytesTransaction(pk: string) {
  return new SessionBuilder()
    .from(PublicKey.fromHex(pk))
    .wasm(new Uint8Array([0]))
    .installOrUpgrade()
    .runtimeArgs(Args.fromMap(CLValues))
    .payment(3_000000000) // Amount in motes
    .chainName('casper-net-1')
    .build()
    .getTransactionV1();
}

/**
 * Fake stored contract by name deploy.
 *
 * @param pk - Public key hex.
 * @returns A deploy.
 */
function fakeStoredContractByName(pk: string) {
  const header = new DeployHeader(
    'casper',
    [],
    1,
    new Timestamp(new Date()),
    new Duration(3600000),
  );
  header.account = PublicKey.fromHex(pk);

  const session = new ExecutableDeployItem();
  session.storedContractByName = new StoredContractByName(
    'test',
    'test',
    Args.fromMap(CLValues),
  );

  return Deploy.makeDeploy(
    header,
    ExecutableDeployItem.standardPayment('1'),
    session,
  );
}

/**
 * Fake stored contract by name transaction.
 *
 * @param pk - Public key hex.
 * @returns A transaction V1.
 */
function fakeContractCallTransactionByName(pk: string) {
  return new ContractCallBuilder()
    .from(PublicKey.fromHex(pk))
    .byName('example_contract')
    .entryPoint('unstake')
    .runtimeArgs(Args.fromMap(CLValues))
    .payment(3_000000000) // Amount in motes
    .chainName('casper-net-1')
    .build()
    .getTransactionV1();
}

/**
 * Fake stored contract by hash deploy.
 *
 * @param pk - Public key hex.
 * @returns A deploy.
 */
function fakeStoredContractByHash(pk: string) {
  const header = new DeployHeader(
    'casper',
    [],
    1,
    new Timestamp(new Date()),
    new Duration(3600000),
  );
  header.account = PublicKey.fromHex(pk);

  const session = new ExecutableDeployItem();
  session.storedContractByHash = new StoredContractByHash(
    ContractHash.newContract(
      'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    ),
    'test',
    Args.fromMap(CLValues),
  );

  return Deploy.makeDeploy(
    header,
    ExecutableDeployItem.standardPayment('1'),
    session,
  );
}

/**
 * Fake stored contract by hash transaction.
 *
 * @param pk - Public key hex.
 * @returns A transaction V1.
 */
function fakeContractCallTransactionByHash(pk: string) {
  return new ContractCallBuilder()
    .from(PublicKey.fromHex(pk))
    .byHash('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')
    .entryPoint('unstake')
    .runtimeArgs(Args.fromMap(CLValues))
    .payment(3_000000000) // Amount in motes
    .chainName('casper-net-1')
    .build()
    .getTransactionV1();
}

/**
 * Fake stored version contract by name deploy.
 *
 * @param pk - Public key hex.
 * @returns A deploy.
 */
function fakeStoredVersionContractByName(pk: string) {
  const header = new DeployHeader(
    'casper',
    [],
    1,
    new Timestamp(new Date()),
    new Duration(3600000),
  );
  header.account = PublicKey.fromHex(pk);

  const session = new ExecutableDeployItem();
  session.storedVersionedContractByName = new StoredVersionedContractByName(
    'test',
    'test',
    Args.fromMap(CLValues),
  );

  return Deploy.makeDeploy(
    header,
    ExecutableDeployItem.standardPayment('1'),
    session,
  );
}

/**
 * Fake versioned stored contract by name transaction.
 *
 * @param pk - Public key hex.
 * @returns A transaction V1.
 */
function fakeVersionedContractCallTransactionByName(pk: string) {
  return new ContractCallBuilder()
    .from(PublicKey.fromHex(pk))
    .byPackageName('example_contract', 1)
    .entryPoint('unstake')
    .runtimeArgs(Args.fromMap(CLValues))
    .payment(3_000000000) // Amount in motes
    .chainName('casper-net-1')
    .build()
    .getTransactionV1();
}

/**
 * Fake stored version contract by hash deploy.
 *
 * @param pk - Public key hex.
 * @returns A deploy.
 */
function fakeStoredVersionContractByHash(pk: string) {
  const header = new DeployHeader(
    'casper',
    [],
    1,
    new Timestamp(new Date()),
    new Duration(3600000),
  );
  header.account = PublicKey.fromHex(pk);

  const session = new ExecutableDeployItem();
  session.storedVersionedContractByHash = new StoredVersionedContractByHash(
    ContractHash.newContract(
      'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    ),
    'test',
    Args.fromMap(CLValues),
  );

  return Deploy.makeDeploy(
    header,
    ExecutableDeployItem.standardPayment('1'),
    session,
  );
}

/**
 * Fake versioned stored contract by hash transaction.
 *
 * @param pk - Public key hex.
 * @returns A transaction V1.
 */
function fakeVersionedContractCallTransactionByHash(pk: string) {
  return new ContractCallBuilder()
    .from(PublicKey.fromHex(pk))
    .byPackageHash(
      'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      1,
    )
    .entryPoint('unstake')
    .runtimeArgs(Args.fromMap(CLValues))
    .payment(3_000000000) // Amount in motes
    .chainName('casper-net-1')
    .build()
    .getTransactionV1();
}

export {
  fakeTransfer,
  fakeTransferTransaction,
  fakeTransferWithOptionalTransferId,
  fakeModuleBytes,
  fakeStoredContractByName,
  fakeContractCallTransactionByName,
  fakeStoredContractByHash,
  fakeContractCallTransactionByHash,
  fakeStoredVersionContractByName,
  fakeVersionedContractCallTransactionByName,
  fakeStoredVersionContractByHash,
  fakeVersionedContractCallTransactionByHash,
  fakeModuleBytesTransaction,
};
