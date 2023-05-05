import { BigNumber, utils } from 'ethers';
import { TokenBalance } from './TokenBalance';
import { AssetType, Network, TokenDefinition } from '../Definitions';
import { ClientRegistry } from '../registry/ClientRegistry';

export class TokenRegistryClient extends ClientRegistry<TokenDefinition> {
  protected cachePath = 'tokens';

  public getAllTokens(network: Network) {
    const subjects = this._getNetworkSubjects(network);
    const allTokens = new Array<TokenDefinition>();
    subjects.forEach((v) => {
      if (v.value) allTokens.push(v.value);
    });
    return allTokens;
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

  public encodeERC1155Id(
    currencyId: number,
    maturity: number,
    assetType: AssetType,
    isfCashDebt = false,
    vaultAddress?: string
  ) {
    if (assetType == AssetType.FCASH_ASSET_TYPE) {
      return this.encodefCashId(currencyId, maturity, isfCashDebt);
    } else if (
      assetType == AssetType.VAULT_CASH_ASSET_TYPE ||
      assetType == AssetType.VAULT_SHARE_ASSET_TYPE ||
      assetType == AssetType.VAULT_DEBT_ASSET_TYPE
    ) {
      if (vaultAddress === undefined) throw Error('Undefined vault address');
      return this.encodeVaultId(vaultAddress, currencyId, maturity, assetType);
    }
    throw Error('Unknown asset type');
  }

  public encodeVaultId(
    vaultAddress: string,
    currencyId: number,
    maturity: number,
    assetType: AssetType
  ): string {
    // Remove the 0x prefix
    const _vaultAddress = vaultAddress.slice(2);
    const _currencyId = currencyId.toString(16).toUpperCase().padStart(4, '0');
    const _maturity = maturity.toString(16).toUpperCase().padStart(10, '0');
    const _assetType = assetType.toString(16).toUpperCase().padStart(2, '0');
    return BigNumber.from(
      '0x' +
        `${_vaultAddress}${_currencyId}${_maturity}${_assetType}`.padStart(
          64,
          '0'
        )
    ).toString();
  }

  public encodefCashId(
    currencyId: number,
    maturity: number,
    isfCashDebt = false
  ): string {
    const _isDebt = isfCashDebt ? '01' : '00';
    const _currencyId = currencyId.toString(16).toUpperCase().padStart(4, '0');
    const _maturity = maturity.toString(16).toUpperCase().padStart(10, '0');
    return BigNumber.from(
      '0x' + `${_isDebt}${_currencyId}${_maturity}01`.padStart(64, '0')
    ).toString();
  }
}
