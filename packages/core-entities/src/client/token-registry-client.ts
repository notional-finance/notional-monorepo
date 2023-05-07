import { BigNumber, utils } from 'ethers';
import { TokenBalance } from '../token-balance';
import { TokenDefinition } from '../definitions';
import { ClientRegistry } from '../registry/client-registry';
import { Network } from '@notional-finance/util';

export class TokenRegistryClient extends ClientRegistry<TokenDefinition> {
  protected cachePath = 'tokens';

  public getAllTokens(network: Network) {
    return Array.from(this.getLatestFromAllSubjects(network).values());
  }

  /**
   * @param network refers to the network the token is deployed on
   * @param symbol the symbol of the token
   * @returns a token definition object or undefined if not found
   */
  public getTokenBySymbol(network: Network, symbol: string) {
    return this.getAllTokens(network).find((t) => t.symbol === symbol);
  }

  /**
   * @param network refers to the network the token is deployed on
   * @param address address of the token
   * @returns a token definition object or undefined if not found
   */
  public getTokenByAddress(network: Network, address: string) {
    const tokens = this.getAllTokens(network).filter(
      (t) => t.address === address
    );

    // This is is possible if searching for ERC1155 tokens or Leveraged Vault tokens
    if (tokens.length > 1) throw Error(`Multiple tokens found for ${address}`);
    return tokens.length === 1 ? tokens[0] : undefined;
  }

  public getTokenByID(network: Network, id: string) {
    const token = this.getLatestFromSubject(network, id);
    if (!token) throw Error(`${id} not found on ${network}`);
    return token;
  }

  /** Allows various tokens to be registered externally on the client */
  public registerToken(token: TokenDefinition) {
    // Do not allow re-registration of subject keys
    this._updateSubjectKeyDirect(token.network, token.id, token, false);
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
