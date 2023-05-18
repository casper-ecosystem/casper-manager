# Casper Snap

Snap to enable MetaMask users interaction with [Casper](https://docs.casperlabs.io/) dapps.
For detailed documentation and integration instructions see our [helper](https://casperholders.github.io/casper-snap/).

## RPC Methods

### casper_getAccount

Take one optional parameter which is `addressIndex`. Default to 0.

Define the index of the Casper address to derive.

### casper_sign

Take 3 arguments :

`deployInfo` -> An object used to display what's inside the deploy we want to sign.
Ex:

```json
{
  "deployType": "Deploy Type",
  "deployHash": "Deploy Hash",
  "signingKey": "Signing key",
  "account": "Account hash",
  "bodyHash": "Body hash",
  "chainName": "Chain name",
  "timestamp": "Timestamp",
  "payment": "Cost of the deploy",
  "deployArgs": {
    "arg1": "value1"
  }
}
```

`message` -> Your deploy hash to sign. Ex: `Buffer.from(deploy.hash).toString('hex')`

`addressIndex` -> Default to 0. Define the index of the Casper address to derive.

### casper_signMessage

Take 2 arguments :

`message` -> Your message to sign. Ex: `Hello World`

`addressIndex` -> Default to 0. Define the index of the Casper address to derive.
