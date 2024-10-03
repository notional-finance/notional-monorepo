import { BigNumber } from 'ethers';
import { VaultAddress } from './constants';
export enum AssetType {
  FCASH_ASSET_TYPE = 1,
  VAULT_SHARE_ASSET_TYPE = 9,
  VAULT_DEBT_ASSET_TYPE = 10,
  VAULT_CASH_ASSET_TYPE = 11,
  LEGACY_NTOKEN_ASSET_TYPE = 12,
}

export function convertToSignedfCashId(id: string, isNegative: boolean) {
  // Required length for fCash ids
  if (isERC1155Id(id)) {
    const { assetType, currencyId, maturity } = decodeERC1155Id(id);
    if (assetType === AssetType.FCASH_ASSET_TYPE) {
      return encodeERC1155Id(currencyId, maturity, assetType, isNegative);
    }
  }

  return id;
}

export function convertToGenericfCashId(id: string) {
  // Required length for fCash ids
  if (isERC1155Id(id)) {
    const { assetType, currencyId, maturity, isfCashDebt } =
      decodeERC1155Id(id);
    if (assetType === AssetType.FCASH_ASSET_TYPE && isfCashDebt) {
      return encodeERC1155Id(currencyId, maturity, assetType, false);
    }
  }

  return id;
}

export function isERC1155Id(id: string) {
  return id.length == 66 && id.startsWith('0x');
}

export function decodeERC1155Id(_id: string) {
  if (!isERC1155Id(_id)) throw Error('Invalid ERC1155 ID');

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
      vaultAddress: `0x${id.slice(8, 48)}` as VaultAddress,
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

export function padToHex256(bn: BigNumber | string) {
  const s = bn instanceof BigNumber ? bn.toHexString() : bn;
  return `0x${s.slice(2).padStart(64, '0')}`.toLowerCase();
}

export function stripHexLeadingZero(bn: BigNumber | string) {
  const s = bn instanceof BigNumber ? bn.toHexString() : bn;
  return `0x${s.slice(2).replace(/^[0]*/, '')}`.toLowerCase();
}
