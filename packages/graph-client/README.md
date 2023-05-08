# graph-client

Generates typed graphql queries using schemas. Schemas can be downloaded directly via URL or using the following command:

`rover graph introspect https://api.thegraph.com/subgraphs/name/notional-finance/mainnet-v2`

See: https://www.apollographql.com/docs/rover/

NOTE: currently BigInt, BigDecimal and Bytes scalars from graphql are deserialized as strings, but we can consider
using an Apollo Link transformer to serialize them properly:

https://github.com/cult-of-coders/apollo-client-transformers

## Building

Run `nx build graph-client` to build the library.

## Running unit tests

Run `nx test graph-client` to execute the unit tests via [Jest](https://jestjs.io).
