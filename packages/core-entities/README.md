# Notional Core Entities

Each core entity has the ability to fetch its state and emit changes as observables. These are the core entities:

- Oracles: a registry of price oracles and a way to calculate exchange rates between currencies
- Tokens: a registry of ERC20, ERC721, and ERC1155 tokens and their metadata
- Yield: a registry of yields produced by different tokens
- Exchanges: off chain simulation for decentralized exchanges
- Configuration: a generic key value store for protocol specific configuration
- Wallet: a mapping of tokens and approvals held by a wallet

## Building

Run `nx build core-entities` to build the library.

## Running unit tests

Run `nx test core-entities` to execute the unit tests via [Jest](https://jestjs.io).
