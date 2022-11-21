# graph-client

Generates typed graphql queries using schemas. Schemas can be downloaded directly via URL or using the following command:

`rover graph introspect https://api.thegraph.com/subgraphs/name/notional-finance/mainnet-v2`

See: https://www.apollographql.com/docs/rover/

## Building

Run `nx build graph-client` to build the library.

## Running unit tests

Run `nx test graph-client` to execute the unit tests via [Jest](https://jestjs.io).
