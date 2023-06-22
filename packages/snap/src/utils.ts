/* eslint-disable no-case-declarations */
import { FixedNumber } from '@ethersproject/bignumber';
import {
  CLAccountHash,
  CLKey,
  CLOption,
  CLPublicKey,
  CLResult,
  CLTypeTag,
  CLURef,
  CLValue,
  DeployUtil,
  encodeBase16,
} from 'casper-js-sdk';

/**
 * Sanitise nested lists.
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
 * @param arg - A CLValue argument from a deploy.
 * @returns Parsed argument to a human-readable string.
 */
function parseDeployArg(arg: CLValue): string {
  const { tag } = arg.clType();
  switch (tag) {
    case CLTypeTag.Unit:
      return String('CLValue Unit');

    case CLTypeTag.Key:
      const key = arg as CLKey;
      if (key.isAccount()) {
        return parseDeployArg(key.value());
      }

      if (key.isURef()) {
        return parseDeployArg(key.value());
      }

      if (key.isHash()) {
        return parseDeployArg(key.value());
      }
      throw new Error('Failed to parse key argument');

    case CLTypeTag.URef:
      return (arg as CLURef).toFormattedStr();

    case CLTypeTag.Option:
      const option = arg as CLOption<any>;
      if (option.isSome()) {
        return parseDeployArg(option.value().unwrap());
      }
      // This will be None due to the above logic
      const optionValue = option.value().toString();
      // This will be the inner CLType of the CLOption e.g. '(bool)'
      const optionCLType = option.clType().toString().split(' ')[1];
      // The format ends up looking like `None (bool)`
      return `${optionValue} ${optionCLType}`;

    case CLTypeTag.List:
      return arg.value().map((member: any) => sanitiseNestedLists(member));

    case CLTypeTag.ByteArray:
      const bytes = arg.value();
      return encodeBase16(bytes);

    case CLTypeTag.Result:
      const result = arg as CLResult<any, any>;
      const status = result.isOk() ? 'OK:' : 'ERR:';
      const parsed = parseDeployArg(result.value().val);
      return `${status} ${parsed}`;

    case CLTypeTag.Map:
      return Array.from(arg.toJSON().entries())
        .map((member) => {
          return `${sanitiseNestedLists(
            (member as any[])[0],
          )}: ${sanitiseNestedLists((member as any[])[1])}`;
        })
        .join(',\n');

    case CLTypeTag.Tuple1:
      return parseDeployArg(arg.value()[0]);

    case CLTypeTag.Tuple2:
      return arg.value().map((member: any) => sanitiseNestedLists(member));

    case CLTypeTag.Tuple3:
      return arg.value().map((member: any) => sanitiseNestedLists(member));

    case CLTypeTag.PublicKey:
      return (arg as CLPublicKey).toHex();

    default:
      // Special handling as there is no CLTypeTag for CLAccountHash
      if (arg instanceof CLAccountHash) {
        return encodeBase16(arg.value());
      }
      return arg.value().toString();
  }
}

/**
 * Verify target account hash.
 * @param publicKeyHex - Public key hex string.
 * @param targetAccountHash - Target account hash string.
 */
function verifyTargetAccountMatch(
  publicKeyHex: string,
  targetAccountHash: string,
) {
  const providedTargetKeyHash = encodeBase16(
    CLPublicKey.fromHex(publicKeyHex).toAccountHash(),
  );

  if (providedTargetKeyHash !== targetAccountHash) {
    throw new Error(
      "Provided target public key doesn't match the one in deploy",
    );
  }
}

/**
 * Parse a transfer deploy.
 * @param transferDeploy - A transfer deploy from the casper js sdk.
 * @param providedTarget - Provided target.
 * @returns An object formatted for Metamask Casper Snap.
 */
function parseTransferData(
  transferDeploy: DeployUtil.Transfer,
  providedTarget: string,
): Record<string, unknown> {
  const transferArgs = {} as any;

  // Target can either be a hex formatted public key or an account hash
  const targetFromDeploy = transferDeploy?.getArgByName('target');
  let targetFromDeployHex;

  switch (targetFromDeploy?.clType().tag) {
    // If deploy is created using older version of SDK
    // confirm hash of provided public key matches target account hash from deploy
    case CLTypeTag.ByteArray: {
      targetFromDeployHex = encodeBase16(targetFromDeploy.value());
      // Requester has provided a public key to compare against the target in the deploy
      if (providedTarget) {
        const providedTargetLower = providedTarget.toLowerCase();
        verifyTargetAccountMatch(providedTargetLower, targetFromDeployHex);
      }
      transferArgs['Recipient (Hash)'] = targetFromDeployHex;
      break;
    }

    // If deploy is created using version of SDK gte than 2.7.0
    // In fact this logic can be removed in future as well as pkHex param
    case CLTypeTag.PublicKey: {
      targetFromDeployHex = (targetFromDeploy as CLPublicKey).toHex();
      // Requester has provided a public key to compare against the target in the deploy
      if (providedTarget) {
        if (targetFromDeployHex !== providedTarget) {
          throw new Error(
            "Provided target public key doesn't match the one in the deploy",
          );
        }
      }
      transferArgs['Recipient (Key)'] = targetFromDeployHex;
      break;
    }

    default: {
      throw new Error(
        'Target from deploy was neither AccountHash or PublicKey',
      );
    }
  }
  const amount = transferDeploy?.getArgByName('amount')?.value();

  const id = parseDeployArg(transferDeploy?.getArgByName('id') as CLValue);

  transferArgs.Amount = `${convertMotesToCasper(amount.toString())} CSPR`;
  transferArgs.Motes = `${amount.toString() as string}`;
  transferArgs['Transfer ID'] = id;

  return transferArgs;
}

/**
 * Convert motes to casper.
 * @param motesAmount - Amount in motes.
 * @returns Amount in string.
 */
function convertMotesToCasper(motesAmount: string) {
  try {
    return FixedNumber.from(motesAmount)
      .divUnsafe(FixedNumber.from(1000000000))
      .toString();
  } catch (error) {
    console.log(error);
    return '0';
  }
}

/**
 * Parse a deploy into an object.
 * @param deploy - Deploy from the Casper JS SDK.
 * @param signingKey - Signing Key in the Hex format.
 * @returns Object - Will be used to display information to the user in metamask.
 */
export function deployToObject(deploy: DeployUtil.Deploy, signingKey: string) {
  const { header } = deploy;
  const deployAccount = header.account.toHex();
  if (!deploy.isStandardPayment()) {
    throw new Error('Signer does not yet support non-standard payment');
  }

  const paymentValue = deploy.payment.moduleBytes
    ?.getArgByName('amount')
    ?.value();
  const payment = `${convertMotesToCasper(paymentValue)} CSPR`;
  const paymentMotes = `${paymentValue.toString() as string}`;

  let type;

  if (deploy.isTransfer()) {
    type = 'Transfer';
  } else if (deploy.session.isModuleBytes()) {
    type = 'WASM-Based Deploy';
  } else if (
    deploy.session.isStoredContractByHash() ||
    deploy.session.isStoredContractByName()
  ) {
    type = 'Contract Call';
  } else {
    type = 'Contract Package Call';
  }

  let deployArgs = {} as any;
  if (deploy.session.transfer) {
    deployArgs = parseTransferData(
      deploy.session.transfer,
      (deploy as any).targetKey,
    );
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
          Provided session code: ${deploy.session as unknown as string}`);
    }

    storedContract.args.args.forEach((argument, key) => {
      deployArgs[key] = parseDeployArg(argument);
    });
    deployArgs['Entry Point'] = storedContract.entryPoint;
  }
  return {
    deployHash: encodeBase16(deploy.hash),
    signingKey,
    account: deployAccount,
    bodyHash: encodeBase16(header.bodyHash),
    chainName: header.chainName,
    timestamp: new Date(header.timestamp).toLocaleString(),
    gasPrice: header.gasPrice.toString(),
    payment,
    paymentMotes,
    deployType: type,
    deployArgs,
  };
}

/**
 * Add a signature to a deploy and validate it.
 * @param deploy - Deploy object.
 * @param signature - Signature bytes.
 * @param publicKeyHex - Public key hex string.
 * @returns Object - Either an object containing the deploy or an error.
 */
export function addSignatureAndValidateDeploy(
  deploy: DeployUtil.Deploy,
  signature: Uint8Array,
  publicKeyHex: string,
) {
  const signedDeploy = DeployUtil.setSignature(
    deploy,
    signature,
    CLPublicKey.fromHex(publicKeyHex),
  );
  const validatedSignedDeploy = DeployUtil.validateDeploy(signedDeploy);
  if (validatedSignedDeploy.ok) {
    return { deploy: DeployUtil.deployToJson(validatedSignedDeploy.val) };
  }
  return { error: 'Unable to verify deploy after signature.' };
}
