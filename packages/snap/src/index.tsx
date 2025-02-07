import { getBIP44AddressKeyDeriver } from '@metamask/key-tree';
import type { OnRpcRequestHandler } from '@metamask/snaps-sdk';
import type { SnapComponent } from '@metamask/snaps-sdk/jsx';
import {
  Bold,
  Box,
  Copyable,
  Heading,
  Link,
  Row,
  Section,
  Text,
  Tooltip,
} from '@metamask/snaps-sdk/jsx';
import {
  AccountHash,
  Conversions,
  Deploy,
  Hash,
  KeyAlgorithm,
  PrivateKey,
  PublicKey,
  Transaction,
  TransactionV1,
} from 'casper-js-sdk';

import {
  formatAccountHashTruncate,
  transactionToObject,
  truncate,
} from './utils';

/* eslint-disable no-restricted-globals */

/**
 * Get casper address.
 *
 * @param addressIndex - Address index.
 * @returns The public key hex of the user.
 */
async function getCSPRAddress(addressIndex = 0) {
  const bip44Node = await snap.request({
    method: 'snap_getBip44Entropy',
    params: {
      coinType: 506,
    },
  });
  const bip44Nodeaddr = await getBIP44AddressKeyDeriver(bip44Node);
  const addressKey = await bip44Nodeaddr(addressIndex);

  if (addressKey.curve === 'ed25519') {
    return {
      publicKey: PublicKey.fromBytes(
        Buffer.from(`01${addressKey.compressedPublicKey.slice(2)}`, 'hex'),
      ).result.toHex(),
    };
  }

  if (addressKey.curve === 'secp256k1') {
    return {
      publicKey: PublicKey.fromBytes(
        Buffer.from(`02${addressKey.compressedPublicKey.slice(2)}`, 'hex'),
      ).result.toHex(),
    };
  }

  return {
    error: `Unsupported curve. Received ${addressKey.curve}. Only Secp256K1 && Ed25519 are supported.`,
  };
}

type ArgProps = {
  arg: string;
};

const DisplayArg: SnapComponent<ArgProps> = ({ arg }) => {
  try {
    if (AccountHash.fromString(arg)) {
      return (
        <Tooltip content={arg}>
          <Link
            href={`https://cspr.live/search/${arg.replace(
              'account-hash-',
              '',
            )}`}
          >
            {formatAccountHashTruncate(arg)}
          </Link>
        </Tooltip>
      );
    }
  } catch {
    // Do nothing
  }
  try {
    if (PublicKey.fromHex(arg)) {
      return (
        <Tooltip content={arg}>
          <Link href={`https://cspr.live/search/${arg}`}>{truncate(arg)}</Link>
        </Tooltip>
      );
    }
  } catch {
    // Do nothing
  }
  try {
    if (Hash.fromHex(arg)) {
      return <Copyable value={arg} />;
    }
  } catch {
    // Do nothing
  }
  return <Text>{arg}</Text>;
};

type PaymentProps = {
  transaction: Transaction;
};

const Payment: SnapComponent<PaymentProps> = ({ transaction }) => {
  if (transaction.pricingMode.paymentLimited) {
    return (
      <Box>
        <Row label="Payment Type">
          <Text>Limited</Text>
        </Row>
        <Row label="Gas price tolerance">
          <Text>
            {transaction.pricingMode.paymentLimited.gasPriceTolerance.toString()}
          </Text>
        </Row>
        <Row label="Payment Amount">
          <Text>
            {Conversions.motesToCSPR(
              transaction.pricingMode.paymentLimited.paymentAmount,
            )}{' '}
            CSPR
          </Text>
        </Row>
      </Box>
    );
  }
  if (transaction.pricingMode.fixed) {
    return (
      <Box>
        <Row label="Payment Type">
          <Text>Fixed</Text>
        </Row>
        <Row label="Gas price tolerance">
          <Text>
            {transaction.pricingMode.fixed.gasPriceTolerance.toString()}
          </Text>
        </Row>
        <Row label="Additional Computation Power">
          <Text>
            {transaction.pricingMode.fixed.additionalComputationFactor.toString()}
          </Text>
        </Row>
      </Box>
    );
  }
  if (transaction.pricingMode.prepaid) {
    return (
      <Box>
        <Row label="Payment Type">
          <Text>Prepaid</Text>
        </Row>
        <Row label="Receipt">
          <Text>{transaction.pricingMode.prepaid?.receipt.toHex()}</Text>
        </Row>
      </Box>
    );
  }
  if (transaction.getDeploy()?.isStandardPayment()) {
    return (
      <Box>
        <Row label="Payment Type">
          <Text>Standard</Text>
        </Row>
        <Row label="Amount">
          <Text>
            {Conversions.motesToCSPR(
              transaction
                .getDeploy()
                ?.payment.moduleBytes?.args.getByName('amount')
                ?.toString() as string,
            )}{' '}
            CSPR
          </Text>
        </Row>
      </Box>
    );
  }
  return (
    <Row label="Payment Type">
      <Text>Not supported</Text>
    </Row>
  );
};

type CallDetailsProps = {
  transaction: Transaction;
  deployArgs: object;
  deployType: string;
};

type CallArgumentsProps = {
  deployArgs: object;
};

const CallArguments: SnapComponent<CallArgumentsProps> = ({ deployArgs }) => {
  if (Object.entries(deployArgs).length > 0) {
    return (
      <Box>
        <Heading>Arguments</Heading>
        {Object.entries(deployArgs).map((arg: any) => (
          <Box>
            <Text>
              <Bold>{arg[0]}</Bold>
            </Text>
            {Array.isArray(arg[1]) ? (
              <Text>{arg[1].join(',')}</Text>
            ) : (
              <DisplayArg arg={arg[1]} />
            )}
          </Box>
        ))}
      </Box>
    );
  }
  return (
    <Box>
      <Text> </Text>
    </Box>
  );
};

const CallDetails: SnapComponent<CallDetailsProps> = ({
  transaction,
  deployArgs,
  deployType,
}) => {
  if (transaction.target.stored?.id.byHash) {
    return (
      <Section>
        <Box>
          <CallArguments deployArgs={deployArgs} />
          <Heading>Contract</Heading>
          <Text>
            <Bold>Hash</Bold>
          </Text>
          <Text>{transaction.target.stored?.id.byHash.toHex()}</Text>
          <Text>
            <Bold>Entrypoint</Bold>
          </Text>
          <Text>{transaction.entryPoint.customEntryPoint ?? deployType}</Text>
        </Box>
      </Section>
    );
  }
  if (transaction.target.stored?.id.byName) {
    return (
      <Section>
        <Box>
          <CallArguments deployArgs={deployArgs} />
          <Heading>Contract</Heading>
          <Text>
            <Bold>Name</Bold>
          </Text>
          <Text>{transaction.target.stored?.id.byName}</Text>
          <Text>
            <Bold>Entrypoint</Bold>
          </Text>
          <Text>{transaction.entryPoint.customEntryPoint ?? deployType}</Text>
        </Box>
      </Section>
    );
  }
  if (transaction.target.stored?.id.byPackageHash) {
    return (
      <Section>
        <Box>
          <CallArguments deployArgs={deployArgs} />
          <Heading>Contract</Heading>
          <Text>
            <Bold>Package Hash</Bold>
          </Text>
          <Text>
            {transaction.target.stored?.id.byPackageHash.addr.toHex()}
          </Text>
          <Text>
            <Bold>Package Version</Bold>
          </Text>
          <Text>
            {transaction.target.stored?.id.byPackageHash.version?.toString() ??
              'Latest'}
          </Text>
          <Text>
            <Bold>Entrypoint</Bold>
          </Text>
          <Text>{transaction.entryPoint.customEntryPoint ?? deployType}</Text>
        </Box>
      </Section>
    );
  }
  if (transaction.target.stored?.id.byPackageName) {
    return (
      <Section>
        <Box>
          <CallArguments deployArgs={deployArgs} />
          <Heading>Contract</Heading>
          <Text>
            <Bold>Package Name</Bold>
          </Text>
          <Text>{transaction.target.stored?.id.byPackageName.name}</Text>
          <Text>
            <Bold>Package Version</Bold>
          </Text>
          <Text>
            {transaction.target.stored?.id.byPackageName.version?.toString() ??
              'Latest'}
          </Text>
          <Text>
            <Bold>Entrypoint</Bold>
          </Text>
          <Text>{transaction.entryPoint.customEntryPoint ?? deployType}</Text>
        </Box>
      </Section>
    );
  }
  if (Object.entries(deployArgs).length > 0) {
    return (
      <Section>
        <Box>
          <CallArguments deployArgs={deployArgs} />
          <Text> </Text>
        </Box>
      </Section>
    );
  }
  return (
    <Box>
      <Text> </Text>
    </Box>
  );
};

/**
 * Displays a prompt to the user in the MetaMask UI.
 *
 * @param transaction - Transaction object that will be parsed to display the content of if.
 * @param signingKey - Hex encoded public key address.
 * @param origin - Origin of the request.
 * @returns `true` if the user accepted the confirmation,
 * and `false` otherwise.
 */
async function promptUserDeployInfo(
  transaction: Transaction,
  signingKey: string,
  origin: string,
) {
  const deployInfo = await transactionToObject(transaction, signingKey);
  return await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'confirmation',
      content: (
        <Box>
          <Box center={true}>
            <Heading size={'md'}>{deployInfo.deployType} request</Heading>
          </Box>
          <Box>
            <Text>Review the transaction details requested by {origin}.</Text>
          </Box>
          <CallDetails
            transaction={transaction}
            deployArgs={deployInfo.deployArgs}
            deployType={deployInfo.deployType}
          />
          <Section>
            <Text>
              <Bold>Signing Key</Bold>
            </Text>
            <Tooltip content={deployInfo.signingKey}>
              <Link href={`https://cspr.live/search/${deployInfo.signingKey}`}>
                {truncate(deployInfo.signingKey)}
              </Link>
            </Tooltip>
            <Text>
              <Bold>Account</Bold>
            </Text>

            <Tooltip
              content={
                transaction.initiatorAddr.publicKey?.toHex() ??
                transaction.initiatorAddr.accountHash?.toHex() ??
                ''
              }
            >
              <Link
                href={`https://cspr.live/search/${
                  transaction.initiatorAddr.publicKey?.toHex() ??
                  transaction.initiatorAddr.accountHash
                    ?.toHex()
                    .replace('account-hash-', '') ??
                  ''
                }`}
              >
                {truncate(transaction.initiatorAddr.publicKey?.toHex() ?? '')}
                {`${formatAccountHashTruncate(
                  transaction.initiatorAddr.accountHash?.toHex() ?? '',
                )}`}
              </Link>
            </Tooltip>
            <Text>
              <Bold>Transaction Hash</Bold>
            </Text>
            <Copyable value={transaction.hash.toHex()} />
          </Section>
          <Section>
            <Row label="Chain">
              <Text>{transaction.chainName}</Text>
            </Row>
            <Row label="Timestamp">
              <Text>{deployInfo.timestamp}</Text>
            </Row>
            <Payment transaction={transaction} />
          </Section>
        </Box>
      ),
    },
  });
}

/**
 * Sign a deploy.
 *
 * @param deployJson - JSON formatted deploy.
 * @param transaction - JSON formatted transaction.
 * @param origin - Origin of the request.
 * @param addressIndex - Address index.
 * @returns A signed deploy or an error.
 */
async function sign(
  deployJson: any,
  transaction: any,
  origin: string,
  addressIndex = 0,
) {
  const publicKeyHex = (await getCSPRAddress(addressIndex)).publicKey;
  if (!publicKeyHex) {
    return { error: `Unable to get public key at index ${addressIndex}.` };
  }
  try {
    let transactionParsed;
    if (deployJson && transaction) {
      return {
        error:
          'Only deployJson field or transaction field should be populated not both.',
      };
    }
    if (deployJson) {
      if (Transaction.fromJSON(deployJson).getDeploy() === undefined) {
        return { error: `The field deployJson only supports legacy deploys` };
      }
      transactionParsed = Transaction.fromJSON(deployJson);
    } else {
      transactionParsed = Transaction.fromJSON(transaction);
    }

    const bip44Node = await snap.request({
      method: 'snap_getBip44Entropy',
      params: {
        coinType: 506,
      },
    });
    const bip44Nodeaddr = await getBIP44AddressKeyDeriver(bip44Node);
    const addressKey = await bip44Nodeaddr(addressIndex);
    const response = await promptUserDeployInfo(
      transactionParsed,
      publicKeyHex,
      origin,
    );
    if (!response) {
      return false;
    }

    if (addressKey.privateKeyBytes) {
      if (addressKey.curve === 'ed25519') {
        const privateKey = PrivateKey.fromHex(
          addressKey.privateKey?.slice(2) ?? '',
          KeyAlgorithm.ED25519,
        );
        transactionParsed.sign(privateKey);
        if (deployJson) {
          return {
            deploy: Deploy.toJSON(transactionParsed.getDeploy() as Deploy),
          };
        }
        return {
          transaction: TransactionV1.toJSON(
            transactionParsed.getTransactionV1() as TransactionV1,
          ),
        };
      }

      if (addressKey.curve === 'secp256k1') {
        const privateKey = PrivateKey.fromHex(
          addressKey.privateKey?.slice(2) ?? '',
          KeyAlgorithm.SECP256K1,
        );
        transactionParsed.sign(privateKey);
        if (deployJson) {
          return {
            deploy: Deploy.toJSON(transactionParsed.getDeploy() as Deploy),
          };
        }
        return {
          transaction: TransactionV1.toJSON(
            transactionParsed.getTransactionV1() as TransactionV1,
          ),
        };
      }

      return {
        error: `Unsupported curve : ${addressKey.curve}. Only Secp256K1 && Ed25519 are supported.`,
      };
    }
  } catch (error) {
    return {
      error: `Unable to convert json into deploy object. Details : ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }

  return {
    error: `No private key associated with the account ${addressIndex}.`,
  };
}

/**
 * Sign a message.
 *
 * @param message - Message.
 * @param origin - Origin of the request.
 * @param addressIndex - Address index.
 * @returns A signed message or an error.
 */
async function signMessage(message: string, origin: string, addressIndex = 0) {
  const bip44Node = await snap.request({
    method: 'snap_getBip44Entropy',
    params: {
      coinType: 506,
    },
  });
  const bip44Nodeaddr = await getBIP44AddressKeyDeriver(bip44Node);
  const addressKey = await bip44Nodeaddr(addressIndex);
  const messageBytes = Uint8Array.from(
    Buffer.from(`Casper Message:\n${message}`),
  );
  const publicKeyHex = (await getCSPRAddress(addressIndex)).publicKey;
  const response = await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'confirmation',
      content: (
        <Box>
          <Heading>Sign message</Heading>
          <Text>
            <Bold>Request origin</Bold>
          </Text>
          <Copyable value={origin}></Copyable>

          <Text>
            <Bold>Signing Key</Bold>
          </Text>
          <Copyable value={publicKeyHex ?? ''}></Copyable>
          <Text>
            <Bold>Message</Bold>
          </Text>
          <Copyable value={message}></Copyable>
        </Box>
      ),
    },
  });

  if (!response) {
    return false;
  }

  if (addressKey.privateKeyBytes) {
    if (addressKey.curve === 'ed25519') {
      const privateKey = PrivateKey.fromHex(
        addressKey.privateKey?.slice(2) ?? '',
        KeyAlgorithm.ED25519,
      );
      return {
        signature: Buffer.from(
          privateKey.signAndAddAlgorithmBytes(messageBytes),
        ).toString('hex'),
      };
    }

    if (addressKey.curve === 'secp256k1') {
      const privateKey = PrivateKey.fromHex(
        addressKey.privateKey?.slice(2) ?? '',
        KeyAlgorithm.SECP256K1,
      );
      const res = privateKey.signAndAddAlgorithmBytes(messageBytes);
      return { signature: Buffer.from(res).toString('hex') };
    }
    return {
      error: `Unsupported curve : ${addressKey.curve}. Only Secp256K1 && Ed25519 are supported.`,
    };
  }
  return { error: 'No private key associated with the account.' };
}

/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param args - The request handler args as object.
 * @param args.origin - The origin of the request, e.g., the website that
 * invoked the snap.
 * @param args.request - A validated JSON-RPC request object.
 * @returns The result of `snap_dialog`.
 * @throws If the request method is not valid for this snap.
 */
export const onRpcRequest: OnRpcRequestHandler = async ({
  origin,
  request,
}) => {
  switch (request.method) {
    case 'casper_getAccount':
      return getCSPRAddress(request?.params?.addressIndex);
    case 'casper_sign':
      return sign(
        request?.params?.deployJson,
        request?.params?.transaction,
        origin,
        request?.params?.addressIndex,
      );
    case 'casper_signMessage':
      return signMessage(
        request?.params?.message,
        origin,
        request?.params?.addressIndex,
      );
    default:
      throw new Error('Method not found.');
  }
};
