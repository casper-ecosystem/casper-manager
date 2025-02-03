/* eslint-disable no-case-declarations */
/* eslint-disable no-restricted-globals */
import {
  AccountHash,
  Conversions,
  TransactionEntryPointEnum,
  TypeID,
} from 'casper-js-sdk';
import type {
  CLValue,
  CLValueByteArray,
  CLValueList,
  Key,
  URef,
  Transaction,
  CLValueMap,
} from 'casper-js-sdk';
import type { CLValueResult } from 'casper-js-sdk/dist/types/clvalue/Result';

import { CSPR_API_PROXY_REFERER } from './constants/config';

/**
 * Sanitise nested lists.
 *
 * @param value - A value from a list.
 * @returns Sanitised value.
 */
function sanitiseNestedLists(value: any) {
  const parsedValue = parseDeployArg(value);
  if (Array.isArray(parsedValue)) {
    const parsedType = value.vectorType;
    return `<${parsedType as string}>[...]`;
  }
  return parsedValue;
}

/**
 * Parse a deploy argument.
 *
 * @param arg - A CLValue argument from a deploy.
 * @returns Parsed argument to a human-readable string.
 */
export function parseDeployArg(arg: unknown): string | any[] {
  const tag = (arg as CLValue).type.getTypeID();
  switch (tag) {
    case TypeID.Unit:
      return String('CLValue Unit');

    case TypeID.Key:
      return ((arg as CLValue).key as Key).toString();

    case TypeID.URef:
      return ((arg as CLValue).uref as URef).toString();

    case TypeID.Option:
      const option = arg as CLValue;
      if (!option.option?.isEmpty()) {
        return parseDeployArg(option.option?.value());
      }
      return `${option.toString()} ${option.type?.toString() ?? ''}`;

    case TypeID.List:
      return ((arg as CLValue).list as CLValueList).elements.map(
        (member: any) => sanitiseNestedLists(member),
      );

    case TypeID.ByteArray:
      return ((arg as CLValue).byteArray as CLValueByteArray).toString();

    case TypeID.Result:
      const result = (arg as CLValue).result as CLValueResult;
      const status = result.isSuccess ? 'OK:' : 'ERR:';
      const parsed = parseDeployArg(result.value());
      return `${status} ${parsed as string}`;

    case TypeID.Map:
      const map = ((arg as CLValue).map as CLValueMap).getData();
      let mapParsedString = '';
      map.forEach((tuple) => {
        mapParsedString += `${parseDeployArg(tuple.value()[0]) as string}=${
          parseDeployArg(tuple.value()[1]) as string
        }`;
      });
      return mapParsedString;

    case TypeID.Tuple1:
      return parseDeployArg((arg as CLValue).tuple1?.value());

    case TypeID.Tuple2:
      return (
        (arg as CLValue).tuple2
          ?.value()
          .map((member: any) => sanitiseNestedLists(member)) ?? ''
      );

    case TypeID.Tuple3:
      return (
        (arg as CLValue).tuple3
          ?.value()
          .map((member: any) => sanitiseNestedLists(member)) ?? ''
      );

    case TypeID.PublicKey:
      return (arg as CLValue).publicKey?.toHex() ?? '';

    case TypeID.U32:
      return (arg as CLValue).ui32?.toNumber().toString() ?? '';

    default:
      // Special handling as there is no TypeID for CLAccountHash
      if (arg instanceof AccountHash) {
        return arg.toPrefixedString();
      }
      return (arg as CLValue).toString();
  }
}

/**
 * Parse a transfer deploy.
 *
 * @param transferDeploy - A transfer deploy from the casper js sdk.
 * @returns An object formatted for Metamask Casper Snap.
 */
async function parseTransferData(
  transferDeploy: Transaction,
): Promise<Record<string, unknown>> {
  const transferArgs = {} as any;

  // Target can either be a hex formatted public key or an account hash

  transferArgs.Recipient = transferDeploy.args.args.get('target')?.toString();

  const amount = transferDeploy?.args.args.get('amount')?.toString() ?? '';

  const id = transferDeploy?.args.args.get('id')?.toString();

  transferArgs.Amount = `${Conversions.motesToCSPR(amount).toString()} CSPR`;
  try {
    const rateResponse = await (
      await fetch('https://api.mainnet.casperwallet.io/rates/1/amount', {
        headers: {
          'Content-Type': 'application/json',
          Referer: CSPR_API_PROXY_REFERER,
        },
      })
    ).json();
    transferArgs['USD Value'] = `${
      parseFloat(Conversions.motesToCSPR(amount)) * rateResponse.data.amount
    }`;
  } catch (error) {
    console.warn(error, 'Error while retrieving CSPR Rate.');
  }
  if (id) {
    transferArgs['Transfer ID'] = id;
  }

  return transferArgs;
}

/**
 * Truncate a string.
 *
 * @param fullStr - Original string.
 * @returns Truncated string.
 */
export function truncate(fullStr: string) {
  if (fullStr.length <= 15) {
    return fullStr;
  }

  const separator = '...';
  return (
    fullStr.substring(0, 5) + separator + fullStr.substring(fullStr.length - 5)
  );
}

/**
 * Parse a transaction into an object.
 *
 * @param transaction - Transaction from the Casper JS SDK.
 * @param signingKey - Signing Key in the Hex format.
 * @returns Object - Will be used to display information to the user in metamask.
 */
export async function transactionToObject(
  transaction: Transaction,
  signingKey: string,
) {
  const deployAccount = transaction.initiatorAddr.publicKey
    ? transaction.initiatorAddr.publicKey.toHex()
    : transaction.initiatorAddr.accountHash?.toHex();

  let type;

  switch (transaction.entryPoint.type) {
    case TransactionEntryPointEnum.Transfer:
      type = 'Transfer';
      break;
    case TransactionEntryPointEnum.AddBid:
      type = 'Add Bid';
      break;
    case TransactionEntryPointEnum.WithdrawBid:
      type = 'Withdraw Bid';
      break;
    case TransactionEntryPointEnum.Delegate:
      type = 'Delegate';
      break;
    case TransactionEntryPointEnum.Undelegate:
      type = 'Undelegate';
      break;
    case TransactionEntryPointEnum.Redelegate:
      type = 'Redelegate';
      break;
    case TransactionEntryPointEnum.ActivateBid:
      type = 'Activate Bid';
      break;
    case TransactionEntryPointEnum.ChangeBidPublicKey:
      type = 'Change Bid Public Key';
      break;
    case TransactionEntryPointEnum.AddReservations:
      type = 'Add Reservations';
      break;
    case TransactionEntryPointEnum.CancelReservations:
      type = 'Cancel Reservations';
      break;
    case TransactionEntryPointEnum.Call:
      type = 'Contract Call';
      break;
    default:
      type = 'WASM-based';
      break;
  }

  const deploy = transaction.getDeploy();
  const transactionV1 = transaction.getTransactionV1();
  if (deploy) {
    let deployArgs = {} as any;
    if (deploy.session.transfer) {
      deployArgs = await parseTransferData(transaction);
    } else if (deploy.session.moduleBytes) {
      deploy.session.moduleBytes.args.args.forEach((argument, key) => {
        deployArgs[key] = parseDeployArg(argument);
      });
    } else {
      let storedContract;
      if (deploy.session.storedContractByHash) {
        storedContract = deploy.session.storedContractByHash;
      } else if (deploy.session.storedContractByName) {
        storedContract = deploy.session.storedContractByName;
      } else if (deploy.session.storedVersionedContractByHash) {
        storedContract = deploy.session.storedVersionedContractByHash;
      } else if (deploy.session.storedVersionedContractByName) {
        storedContract = deploy.session.storedVersionedContractByName;
      } else {
        throw new Error(`Stored Contract could not be parsed.\n\
          Provided session code: ${deploy.session.bytes().toString()}`);
      }

      storedContract.args.args.forEach((argument, key) => {
        deployArgs[key] = parseDeployArg(argument);
      });
      deployArgs['Entry Point'] = storedContract.entryPoint;
    }
    return {
      deployHash: transaction.hash.toHex(),
      signingKey,
      account: deployAccount,
      bodyHash: deploy.header.bodyHash?.toHex(),
      chainName: transaction.chainName,
      timestamp: new Date(transaction.timestamp.date).toLocaleString(),
      gasPrice: deploy.header.gasPrice.toString(),
      deployType: type,
      deployArgs,
    };
  } else if (transactionV1) {
    let deployArgs = {} as any;
    if (transaction.entryPoint.type === TransactionEntryPointEnum.Transfer) {
      deployArgs = await parseTransferData(transaction);
    } else {
      transaction.args.args.forEach((argument, key) => {
        deployArgs[key] = parseDeployArg(argument);
      });
    }
    return {
      deployHash: transaction.hash.toHex(),
      signingKey,
      account: deployAccount,
      bodyHash: Conversions.encodeBase16(transaction.entryPoint.toBytes()),
      chainName: transaction.chainName,
      timestamp: new Date(transaction.timestamp.date).toLocaleString(),
      deployType: type,
      deployArgs,
    };
  }
  throw new Error('Unsupported transaction type');
}
