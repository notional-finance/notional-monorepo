import { BigNumber, utils } from 'ethers';
import { TokenBalance } from './TokenBalance';
import { Network, TokenDefinition } from '../Definitions';
import { ClientRegistry } from '../registry/ClientRegistry';

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

  public makeBalance(
    input: string | BigNumber,
    id: string,
    network: Network,
    maturity?: number
  ) {
    const token = this.getTokenByID(network, id);

    const value =
      typeof input === 'string'
        ? utils.parseUnits(input.replace(/,/g, ''), token.decimals)
        : input;

    // Will throw an error if maturity is required and not set
    return TokenBalance.from(value, Object.assign(token, maturity));
  }
}
