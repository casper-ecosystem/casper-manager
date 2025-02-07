# Casper Snap

Snap to enable MetaMask users interaction with [Casper](https://docs.casperlabs.io/) dapps.
For detailed documentation and integration instructions see our [helper](https://casper-ecosystem.github.io/casper-manager/).

Read the [FAQ](FAQ.md) and the [Knowledge Base](KnowledgeBase.md).

## Testing Casper Snap

The snap have been audited by [Halborn](https://www.halborn.com/) on the 20th June 2023.
You can find the audit [here](./audits/20_06_2023_Casper_Management_Snap_App_WebApp_Pentest_Report_Halborn_Final.pdf).
You can find the code difference between the audit and now [here](https://github.com/casper-ecosystem/casper-manager/compare/halbornAudit...main).

## Testing Casper Manager Snap

### MetaMask Snaps Open Beta

The MetaMask Snaps Open Beta is a first look at what's possible when extending the capabilities of your wallet. We invite those who are comfortable trying new features to test out these Snaps built by talented community developers.

### Live demo dapp

Test Casper Snap on [CSPR.live](https://cspr.live) !

## Development

You must build locally before committing any change to the snap because the shasum on the CICD must match the shasum commited.

### Requirements

```
node lts
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

- Run lint

```sh
yarn lint:fix
```

- Build

```sh
yarn build
```

- Run snap tests

```sh
yarn test
```
