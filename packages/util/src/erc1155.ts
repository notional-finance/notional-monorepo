import { BigNumber } from 'ethers';

export enum AssetType {
  FCASH_ASSET_TYPE = 1,
  VAULT_CASH_ASSET_TYPE = 9,
  VAULT_SHARE_ASSET_TYPE = 10,
  VAULT_DEBT_ASSET_TYPE = 11,
  LEGACY_NTOKEN_ASSET_TYPE = 12,
}

export function decodeERC1155Id(_id: string) {
  // Slice off the 0x prefix
  const id = _id.startsWith('0x') ? _id.slice(2) : _id;
  // Slice the last byte of the string
  const assetType = parseInt(id.slice(62), 16);
  if (assetType === AssetType.FCASH_ASSET_TYPE) {
    return {
      assetType,
      maturity: parseInt(id.slice(52, 62), 16),
      currencyId: parseInt(id.slice(48, 52), 16),
      isfCashDebt: parseInt(id.slice(46, 48), 16) == 1,
    };
  } else {
    return {
      assetType,
      maturity: parseInt(id.slice(52, 62), 16),
      currencyId: parseInt(id.slice(48, 52), 16),
      vaultAddress: parseInt(id.slice(8, 48), 16),
      isfCashDebt: false,
    };
  }
}

export function encodeERC1155Id(
  currencyId: number,
  maturity: number,
  assetType: AssetType,
  isfCashDebt = false,
  vaultAddress?: string
) {
  if (assetType == AssetType.FCASH_ASSET_TYPE) {
    return encodefCashId(currencyId, maturity, isfCashDebt);
  } else if (
    assetType == AssetType.VAULT_CASH_ASSET_TYPE ||
    assetType == AssetType.VAULT_SHARE_ASSET_TYPE ||
    assetType == AssetType.VAULT_DEBT_ASSET_TYPE
  ) {
    if (vaultAddress === undefined) throw Error('Undefined vault address');
    return encodeVaultId(vaultAddress, currencyId, maturity, assetType);
  }
  throw Error('Unknown asset type');
}

export function encodeVaultId(
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
  return padToHex256(
    BigNumber.from(
      '0x' +
        `${_vaultAddress}${_currencyId}${_maturity}${_assetType}`.padStart(
          64,
          '0'
        )
    )
  );
}

export function encodefCashId(
  currencyId: number,
  maturity: number,
  isfCashDebt = false
): string {
  const _isDebt = isfCashDebt ? '01' : '00';
  const _currencyId = currencyId.toString(16).toUpperCase().padStart(4, '0');
  const _maturity = maturity.toString(16).toUpperCase().padStart(10, '0');
  return padToHex256(
    BigNumber.from(
      '0x' + `${_isDebt}${_currencyId}${_maturity}01`.padStart(64, '0')
    )
  );
}

function padToHex256(bn: BigNumber) {
  return `0x${bn.toHexString().slice(2).padStart(64, '0')}`.toLowerCase();
}
