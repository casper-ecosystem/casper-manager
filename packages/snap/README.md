# Casper Manager

Snap to enable MetaMask users interaction with [Casper](https://docs.casperlabs.io/) dapps.

For detailed documentation and integration instructions see our [helper](https://casperholders.github.io/casper-snap/).

## RPC Methods

### casper_getAccount

Take one optional parameter which is `addressIndex`. Default to 0.

Define the index of the Casper address to derive.

### casper_sign

Take 3 arguments :

`deployJson` -> A JSON formatted deploy.

`addressIndex` -> Default to 0. Define the index of the Casper address to derive.

### casper_signMessage

Take 2 arguments :

`message` -> Your message to sign. Ex: `Hello World`

`addressIndex` -> Default to 0. Define the index of the Casper address to derive.
