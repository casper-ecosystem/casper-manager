# FAQ

## How to recover funds if the Snap should ever be decommissioned ?

You can import your Metamask private key in any wallet compatible with Casper. (Like [Casper Wallet](https://www.casperwallet.io/))

## How to install the Snap ?

Any website/dapps can request you to install the Snap. It's up to them to implement it.

Here's some website that use the Snap at the moment :

- https://cspr.live/ - A Casper Network Explorer
- https://cspr.market/ - A Casper Network NFT marketplace
- https://casperswap.xyz/ - A Casper Network DEX
- https://casperholders.io/ - A Casper Dapp to use the features of the network (staking/transfer etc...)
- https://div3.in/ - A Casper Network Explorer

## How to use Snap's features ? What does the Snap do ?

The Snap have 3 features :

- Get Account : Retrieve the public key of an account
- Sign a deploy : Sign a valid Casper Deploy
- Sign a message : Sign a string with your key

The dapps can use those features without any restrictions.

Getting an account won't require a user confirmation because it only returns public keys.

The other two requires a user confirmation so you will get a popup from the Metamask Extension asking you to sign a deploy or a message.

Please make sure to review it before signing anything.

## What does the snap NOT do?

The snap doesn't expose any private keys nor allow to sign an invalid deploy.

The snap doesn't have any internet connection capabilities.

The snap doesn't collect any telemetry.

The snap doesn't connect to the Casper Network and can't read any user information from the network.

## How do I reach out for snap support?

You can open an issue on this repository or reach out directly to @killianhash on the [Casper Network Discord server](https://discord.gg/caspernetwork).
