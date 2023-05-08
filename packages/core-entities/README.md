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

## Adding an Exchange Integration

Adding a new exchange integration requires extending the `BaseLiquidityPool` class. The methods that need to be overridden can be seen in the `AbstractLiquidityPool` class.

### Fetching Pool Data

Each pool type needs to fetch its own initialization data given a network and an address using the `getInitData` method. This method must be `static` and return an `AggregateCall[]` array that will be used to populate the pool's state in memory.

The AggregateCall interface allows for multiple stages of fetching where subsequent stages can use the results from previous stages.

### Pool Calculations

A pool type needs to be able to calculate the following information:

    - getLPTokensGivenTokens
    - getTokensOutGivenLPTokens: this takes an optional singleSidedExitTokenIndex for single sided exits
    - calculateTokenTrade

Each of these methods should return a feesPaid array of the amount of fees paid in each token.

### Token Balance

Each pool requires inputs using a `TokenBalance` entity. `TokenBalance` entities can be created via the `TokenRegistry` class using the `TokenRegistry.makeBalance` method. Underlying ERC20 tokens can be added to the TokenRegistry directly in the `DefaultTokens` file.

LP tokens are automatically registered into the `TokenRegistry` inside the `ExchangeRegistry.addPool` method. The `TokenDefinition` for the LP token is defined in the `DefaultPools` file as the `lpToken`.

Therefore, when fetching pool data to initialize the pool, you can do something like this to create a new TokenBalance instance for an LP token:

```
const token = TokenRegistry.getTokenByAddress(network, poolAddress);
return TokenBalance.from(totalSupply, token);
```

To create new TokenBalance instances, you can copy a known TokenBalance instance with a new value or you can scale an existing value. This makes it easier to create new LP TokenBalance instances without going back to the registry:

```
// Copying LP token definition
const oneLPToken = this.totalSupply.copy(this.totalSupply.decimals);
```

### Token Balance Math and Conversions

Whenever possible, use TokenBalance math methods rather than BigNumber. This will protect against improper decimal conversions.

    - scale: creates a new TokenBalance instance scaled by the given numerator and denominator. Checks that the types of the inputs will return a properly scaled balance.
    - mulInRatePrecision / divInRatePrecision: multiplies or divides in RATE_PRECISION
    - ratioWith: returns a ratio in RATE_PRECISION denomination between two numbers
    - scaleTo: scales the token balance to a given number of decimal places, useful for internal pool logic where decimals are in a different precision
    - toToken: does oracle exchange rate conversions using the OracleRegistry


### Fixed Point [Balancer Only]

Balancer V2 uses its own math library which is implemented in `FixedPoint`. To convert into and out of `TokenBalance` use these methods:

    - convertTo: converts a FixedPoint back to a TokenBalance using the proper decimals
    - FixedPoint.convert(): creates a FixedPoint instance from a TokenBalance


## Running unit tests

Run `nx test core-entities` to execute the unit tests via [Jest](https://jestjs.io).

Start anvil in a separate terminal. This is done so that the proper environment variables are set and anvil can store the fork cache in a proper location.

```
    anvil
        --fork-url 'https://eth-mainnet.alchemyapi.io/v2/<API_KEY>'
        --fork-block-number 16605421
        --base-fee 0
        --gas-price 0
        --port 8546
```

Run the exchange pool acceptance tests:

`yarn jest packages/core-entities/tests/exchanges/pool-acceptance.test.ts`

### Pool Acceptance Tests

For each pool in the exchange registry (src/exchanges/DefaultPools.ts) the pool acceptance test does the following in setup:
    
    - Fetches the pool data via ExchangeRegistry.fetchPoolData
    - Creates a pool harness for executing test trades
    - Gets an instance of the pool at a given address from the exchange registry

It then runs the following acceptance tests:

    1. A swap on each token and asserts that the tokens out are equal
    2. A single sided entry and exit on the LP token
    3. A balanced entry and exit on the LP token
    4. [TODO] An unbalanced entry and exit on the LP token
    5. [TODO] A price exposure table for different levels on pool




