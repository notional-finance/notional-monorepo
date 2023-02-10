import { INTERNAL_TOKEN_DECIMAL_PLACES } from '@notional-finance/sdk/config/constants';
import { BigNumber, utils } from 'ethers';
import { TokenBalance } from './TokenBalance';
import defaultTokens from './DefaultTokens';
import { Network, TokenDefinition, TokenInterface } from '../Definitions';

export class TokenRegistry {
  private static tokens: typeof defaultTokens;

  /**
   * @param network refers to the network the token is deployed on
   * @param symbol the symbol of the token
   * @returns a token definition object or undefined if not found
   */
  public static getToken(network: Network, symbol: string) {
    return (
      defaultTokens.get(network)?.get(symbol) ||
      this.tokens.get(network)?.get(symbol)
    );
  }

  /**
   * Registers a new token in the list of tokens
   */
  public static registerToken(token: TokenDefinition) {
    if (this.getToken(token.network, token.symbol)) {
      throw Error(
        `Cannot register duplicate token ${token.symbol} on network ${token.network}`
      );
    }

    let networkMap = this.tokens.get(token.network);
    if (!networkMap) {
      networkMap = new Map<string, TokenDefinition>();
      this.tokens.set(token.network, networkMap);
    }

    networkMap.set(token.symbol, token);
  }

  public static getStrategyTokenDefinition(
    vaultAddress: string,
    network: Network,
    maturity: number
  ) {
    return {
      address: vaultAddress,
      network,
      symbol: `STRATEGY_TOKEN_${vaultAddress}_@_${maturity}`,
      decimalPlaces: INTERNAL_TOKEN_DECIMAL_PLACES,
      tokenInterface: TokenInterface.Notional_StrategyToken,
      maturity,
    };
  }

  public static getVaultShareDefinition(
    vaultAddress: string,
    network: Network,
    maturity: number
  ) {
    return {
      address: vaultAddress,
      network,
      symbol: `VAULT_SHARE_${vaultAddress}_@_${maturity}`,
      decimalPlaces: INTERNAL_TOKEN_DECIMAL_PLACES,
      tokenInterface: TokenInterface.Notional_VaultShare,
      maturity,
    };
  }

  public static isMaturingToken(tokenInterface: TokenInterface) {
    return (
      tokenInterface === TokenInterface.Notional_fCash ||
      tokenInterface === TokenInterface.Notional_VaultShare ||
      tokenInterface === TokenInterface.Notional_StrategyToken ||
      tokenInterface === TokenInterface.Notional_LiquidityToken
    );
  }

  public static makeBalance(
    input: string | BigNumber,
    symbol: string,
    network: Network,
    maturity?: number
  ) {
    const token = this.getToken(network, symbol);
    if (!token) throw Error(`${symbol} not found on ${network}`);

    const value =
      typeof input === 'string'
        ? utils.parseUnits(input.replace(/,/g, ''), token.decimalPlaces)
        : input;

    // Will throw an error if maturity is required and not set
    return TokenBalance.from(value, Object.assign(token, maturity));
  }

  public static makeStrategyToken(
    value: BigNumber,
    vaultAddress: string,
    network: Network,
    maturity: number
  ) {
    return TokenBalance.from(
      value,
      this.getStrategyTokenDefinition(vaultAddress, network, maturity)
    );
  }

  public static makeVaultShare(
    value: BigNumber,
    vaultAddress: string,
    network: Network,
    maturity: number
  ) {
    return TokenBalance.from(
      value,
      this.getVaultShareDefinition(vaultAddress, network, maturity)
    );
  }
}
