export enum TokenStandard {
  /** Standard transferrable ERC20 */
  ERC20,
  /** ERC4626 yield bearing tokens with an extension of ERC20 */
  ERC4626,
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
  network: string;
  /** String based token symbol */
  symbol: string;
  /** Number of native decimal places for the token */
  decimalPlaces: number;
  /** Defines the token standard this token relies on */
  tokenStandard: TokenStandard;
  /** Defines the maturity of the token, if it exists */
  maturity?: number;
}

export class TokenRegistry {}
