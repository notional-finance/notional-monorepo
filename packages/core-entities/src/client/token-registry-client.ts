import { BigNumber, utils } from 'ethers';
import { TokenBalance } from '../token-balance';
import { TokenDefinition } from '..';
import { ClientRegistry } from './client-registry';
import {
  AssetType,
  Network,
  PRIME_CASH_VAULT_MATURITY,
  encodeERC1155Id,
} from '@notional-finance/util';
import { Routes } from '../server';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { TokenType } from '../.graphclient';
import { MaxCurrencyId } from '../config/whitelisted-tokens';

export class TokenRegistryClient extends ClientRegistry<TokenDefinition> {
  constructor(cacheHostname: string) {
    super(cacheHostname);
    // Don't enforce freshness intervals if the subgraph happens to go down. Token
    // data does not change very often
    this.defaultFreshnessIntervals = 0;
  }

  protected cachePath() {
    return Routes.Tokens;
  }

  public getAllTokens(network: Network) {
    const maxCurrencyId = MaxCurrencyId[network];
    const allTokens = Array.from(
      this.getLatestFromAllSubjects(network).values()
    );

    return maxCurrencyId
      ? allTokens.filter(
          (t) => t.currencyId === undefined || t.currencyId <= maxCurrencyId
        )
      : allTokens;
  }

  /**
   * @param network refers to the network the token is deployed on
   * @param symbol the symbol of the token
   * @returns a token definition object or undefined if not found
   */
  private _cache0 = new Map<string, TokenDefinition | undefined>();
  public getTokenBySymbol(network: Network, symbol: string) {
    const cacheKey = `${network}:${symbol}`;
    let token = this._cache0.get(cacheKey);
    if (!token) {
      token = this.getAllTokens(network).find((t) => t.symbol === symbol);
      this._cache0.set(cacheKey, token);
    }
    if (!token) throw Error(`${symbol} not found on ${network}`);
    return token;
  }

  /**
   * @param network refers to the network the token is deployed on
   * @param address address of the token
   * @returns a token definition object or undefined if not found
   */
  public getTokenByAddress(network: Network, address: string) {
    const tokens = this.getAllTokens(network).filter(
      (t) => t.address.toLowerCase() === address.toLowerCase()
    );

    if (tokens.length > 1) throw Error(`Multiple tokens found for ${address}`);
    if (tokens.length < 1) throw Error(`No tokens found for ${address}`);
    return tokens[0];
  }

  public getTokenByID(network: Network, id: string) {
    const token = this.getLatestFromSubject(network, id.toLowerCase());
    if (!token) throw Error(`${id} not found on ${network}`);
    return token;
  }

  public getTokensByCurrencyId(
    network: Network,
    currencyId?: number,
    tokenType?: TokenType
  ) {
    if (currencyId === undefined) throw Error('Unknown currency id');

    const tokens = this.getAllTokens(network).filter(
      (t) =>
        t.currencyId === currencyId &&
        (tokenType === undefined || t.tokenType === tokenType)
    );

    if (tokenType && tokens.length === 0)
      throw Error(`${tokenType} for ${currencyId} not found`);

    return tokens;
  }

  public getPrimeCash(network: Network, currencyId?: number) {
    return this.getTokensByCurrencyId(network, currencyId, 'PrimeCash')[0];
  }

  public getPrimeDebt(network: Network, currencyId?: number) {
    return this.getTokensByCurrencyId(network, currencyId, 'PrimeDebt')[0];
  }

  public getNToken(network: Network, currencyId?: number) {
    return this.getTokensByCurrencyId(network, currencyId, 'nToken')[0];
  }

  public getUnderlying(network: Network, currencyId?: number) {
    return this.getTokensByCurrencyId(network, currencyId, 'Underlying')[0];
  }

  public getVaultShare(
    network: Network,
    vaultAddress: string,
    maturity: number
  ) {
    const vaultShare = this.getAllTokens(network).find(
      (t) =>
        t.vaultAddress?.toLowerCase() === vaultAddress.toLowerCase() &&
        t.maturity === maturity &&
        t.tokenType === 'VaultShare'
    );
    if (!vaultShare) throw Error('Vault Share not found');
    return vaultShare;
  }

  public getVaultDebt(
    network: Network,
    vaultAddress: string,
    maturity: number
  ) {
    const vaultDebt = this.getAllTokens(network).find(
      (t) =>
        t.vaultAddress?.toLowerCase() === vaultAddress.toLowerCase() &&
        t.maturity === maturity &&
        t.tokenType === 'VaultDebt'
    );
    if (!vaultDebt) throw Error('Vault Debt not found');
    return vaultDebt;
  }

  public getVaultCash(
    network: Network,
    vaultAddress: string,
    maturity: number
  ) {
    const vaultCash = this.getAllTokens(network).find(
      (t) =>
        t.vaultAddress?.toLowerCase() === vaultAddress.toLowerCase() &&
        t.maturity === maturity &&
        t.tokenType === 'VaultCash'
    );
    if (!vaultCash) throw Error('Vault Cash not found');
    return vaultCash;
  }

  public unwrapVaultToken(token: TokenDefinition) {
    if (!token.currencyId) {
      return token;
    } else if (
      token.tokenType === 'VaultDebt' &&
      token.maturity &&
      token.maturity !== PRIME_CASH_VAULT_MATURITY
    ) {
      return this.getTokenByID(
        token.network,
        encodeERC1155Id(
          token.currencyId,
          token.maturity,
          AssetType.FCASH_ASSET_TYPE
        )
      );
    } else if (
      token.tokenType === 'VaultDebt' &&
      token.maturity === PRIME_CASH_VAULT_MATURITY
    ) {
      return this.getPrimeDebt(token.network, token.currencyId);
    } else if (token.tokenType === 'VaultCash') {
      return this.getPrimeCash(token.network, token.currencyId);
    } else {
      return token;
    }
  }

  /** Allows various tokens to be registered externally on the client */
  public registerToken(token: TokenDefinition) {
    // Do not allow re-registration of subject keys
    this._updateSubjectKeyDirect(
      token.network,
      token.id.toLowerCase(),
      token,
      false
    );
  }

  public parseInputToTokenBalance(
    input: string | BigNumber,
    idOrSymbol: string,
    network: Network
  ) {
    let token: TokenDefinition | undefined;
    try {
      token = this.getTokenByID(network, idOrSymbol);
    } catch {
      token = this.getTokenBySymbol(network, idOrSymbol);
    }
    if (!token) throw Error(`${idOrSymbol} token not found`);

    const value =
      typeof input === 'string'
        ? utils.parseUnits(input.replace(/,/g, ''), token.decimals)
        : input;

    // Will throw an error if maturity is required and not set
    return TokenBalance.from(value, token);
  }
}
