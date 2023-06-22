# Casper Manager Snap

Snap to enable MetaMask users interaction with [Casper](https://docs.casperlabs.io/) dapps. For detailed documentation and integration instructions see our [helper](https://casperholders.github.io/casper-snap/).

## Audit

The snap have been audited by [Halborn](https://www.halborn.com/) on the 20th June 2023.  
You can find the audit [here](./audits/20_06_2023_Casper_Management_Snap_App_WebApp_Pentest_Report_Halborn_Final.pdf).  
You can find the code difference between the audit and now [here](https://github.com/casperholders/casper-snap/compare/halbornAudit...main).

## Testing Casper Manager Snap

### MetaMask Flask

Snaps is pre-release software available in MetaMask Flask, a canary distribution for developers that provides access to upcoming features.  
To try Snaps [install MetaMask Flask](https://metamask.io/flask/).  


### Live demo dapp

Test Casper Manager Snap inside [CasperHolders Testnet](https://testnet.casperholders.io/) or [Div3](https://div3.in).

## Development

### Requirements

```
node version 16 or above
```

### Usage

- For nvm users

```sh
nvm use
```

---

- Enable corepack

```sh
corepack enable
```

- Install packages

```sh
yarn install
```

- Run local snap server

```sh
yarn start
```

A demo website will available at [http://localhost:8080](http://localhost:8080)

- Run snap tests

```sh
yarn test
```
