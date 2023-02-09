export enum Network {
  All,
  Mainnet,
  Goerli,
}

export enum TokenInterface {
  /** Standard transferrable ERC20 */
  ERC20,
  /** ERC4626 yield bearing tokens with an extension of ERC20 */
  ERC4626,
  /** Special handling for ETH */
  ETH,
  /** Special handling for WETH */
  WETH,
  /** Notional internal ERC20 balances, denominated as 8 decimals  */
  Notional_InternalERC20,
  /** Notional fCash market liquidity tokens, only held by the nToken */
  Notional_LiquidityToken,
  /** Notional fCash, associated with a maturity */
  Notional_fCash,
  /** Notional leveraged vault shares, associated with a maturity */
  Notional_VaultShare,
  /** Notional leveraged vault strategy tokens, associated with a maturity */
  Notional_StrategyToken,
  /** Non-crypto denominated fiat balance (i.e. USD, JPY, EUR) */
  FIAT,
}

export interface TokenDefinition {
  /** Address of the token */
  address: string;
  /** Network the address refers to */
  network: Network;
  /** String based token symbol */
  symbol: string;
  /** Number of native decimal places for the token */
  decimalPlaces: number;
  /** Defines the token standard this token relies on */
  tokenInterface: TokenInterface;
  /** Defines the maturity of the token, if it exists */
  maturity?: number;
}

export enum OracleInterface {
  /** Standard Chainlink IAggregator interface */
  Chainlink,
  /** Balancer V2 time weighted average price oracle */
  BalancerV2_TWAP,
  /** Compound V2 cToken exchange rate */
  CompoundV2_cToken,
  /** Notional time weighted average interest rate oracle */
  Notional_InterestRate,
  /** Notional leveraged vault price oracle */
  Notional_VaultOracle,
}

export interface OracleDefinition {
  /** Address of the oracle */
  address: string;
  /** Network the address refers to */
  network: Network;
  /** Type of oracle interface */
  oracleInterface: OracleInterface;
  /**
   * Base for the oracle, rate is quoted as 1 unit of this token.
   * Must be a valid symbol on the same network.
   */
  base: string;
  /**
   * Quote for the oracle, rate is how many tokens 1 unit of base will purchase.
   * Must be a valid symbol on the same network
   */
  quote: string;
  /** Number of decimal places the rate is quoted in */
  decimalPlaces: number;
  /** Maximum update cadence in seconds, if defined. Typically only valid for off-chain oracles */
  heartbeat?: number;
}
