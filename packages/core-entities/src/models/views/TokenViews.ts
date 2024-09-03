import { ObservableMap, values } from 'mobx';
import { NetworkModel } from '../NetworkModel';
import { Instance, ISimpleType } from 'mobx-state-tree';
import { TokenDefinitionModel } from '../ModelTypes';
import {
  AssetType,
  encodeERC1155Id,
  getNowSeconds,
  PRIME_CASH_VAULT_MATURITY,
} from '@notional-finance/util';
import { BigNumberish } from 'ethers';
import { TokenBalance } from '../../token-balance';

export const TokenViews = (self: Instance<typeof NetworkModel>) => {
  const getAllTokens = () => {
    return values(
      self.tokens as unknown as ObservableMap<
        ISimpleType<string>,
        Instance<typeof TokenDefinitionModel>
      >
    );
  };

  const getTokenBySymbol = (symbol: string) => {
    const t = getAllTokens().find((t) => t.symbol === symbol);
    if (!t) throw Error(`Token ${symbol} not found`);
    return t;
  };

  const getTokenByID = (id: string) => {
    const t = self.tokens.get(id.toLowerCase());
    if (!t) throw Error(`Token ${id} not found`);
    return t;
  };

  const getTokenByAddress = (address: string) => {
    return getAllTokens().find((t) => t.address === address);
  };

  const getTokenByCurrencyId = (currencyId?: number, tokenType?: string) => {
    const t = getAllTokens().find(
      (t) => t.currencyId === currencyId && t.tokenType === tokenType
    );
    if (!t) throw Error(`Token ${currencyId} ${tokenType} not found`);
    return t;
  };

  const getPrimeCash = (currencyId?: number) => {
    return getTokenByCurrencyId(currencyId, 'PrimeCash');
  };

  const getPrimeDebt = (currencyId?: number) => {
    return getTokenByCurrencyId(currencyId, 'PrimeDebt');
  };

  const getNToken = (currencyId?: number) => {
    return getTokenByCurrencyId(currencyId, 'nToken');
  };

  const getUnderlying = (currencyId?: number) => {
    return getTokenByCurrencyId(currencyId, 'Underlying');
  };

  const getVaultShare = (vaultAddress: string, maturity: number) => {
    const t = getAllTokens().find(
      (t) =>
        t.vaultAddress?.toLowerCase() === vaultAddress.toLowerCase() &&
        t.maturity === maturity &&
        t.tokenType === 'VaultShare'
    );
    if (!t) throw Error(`VaultShare ${vaultAddress} ${maturity} not found`);
    return t;
  };

  const getVaultDebt = (vaultAddress: string, maturity: number) => {
    const t = getAllTokens().find(
      (t) =>
        t.vaultAddress?.toLowerCase() === vaultAddress.toLowerCase() &&
        t.maturity === maturity &&
        t.tokenType === 'VaultDebt'
    );
    if (!t) throw Error(`VaultDebt ${vaultAddress} ${maturity} not found`);
    return t;
  };

  const getVaultCash = (vaultAddress: string, maturity: number) => {
    const t = getAllTokens().find(
      (t) =>
        t.vaultAddress?.toLowerCase() === vaultAddress.toLowerCase() &&
        t.maturity === maturity &&
        t.tokenType === 'VaultCash'
    );
    if (!t) throw Error(`VaultCash ${vaultAddress} ${maturity} not found`);
    return t;
  };

  const unwrapVaultToken = (token: Instance<typeof TokenDefinitionModel>) => {
    if (!token.currencyId) {
      return token;
    } else if (
      token.tokenType === 'VaultDebt' &&
      token.maturity &&
      token.maturity !== PRIME_CASH_VAULT_MATURITY
    ) {
      const t = self.tokens.get(
        encodeERC1155Id(
          token.currencyId,
          token.maturity,
          AssetType.FCASH_ASSET_TYPE
        )
      );
      if (!t)
        throw Error(`Token ${token.currencyId} ${token.maturity} not found`);
      return t;
    } else if (
      token.tokenType === 'VaultDebt' &&
      token.maturity === PRIME_CASH_VAULT_MATURITY
    ) {
      return getPrimeDebt(token.currencyId);
    } else if (token.tokenType === 'VaultCash') {
      return getPrimeCash(token.currencyId);
    } else {
      return token;
    }
  };

  const getTokenBalanceFromSymbol = (n: BigNumberish, symbol: string) => {
    const token = getTokenBySymbol(symbol);
    if (!token) throw Error(`Token ${symbol} not found`);
    return TokenBalance.from(n, token);
  };

  const getTokensByType = (tokenType: string, excludeMatured = true) => {
    const t = getAllTokens().filter((t) => t.tokenType === tokenType);
    if (excludeMatured) {
      return t.filter((t) => getNowSeconds() < (t.maturity || 0));
    }

    return t;
  };

  return {
    getAllTokens,
    getTokenByID,
    getTokenBySymbol,
    getTokenByAddress,
    getPrimeCash,
    getPrimeDebt,
    getNToken,
    getUnderlying,
    getVaultShare,
    getVaultDebt,
    getVaultCash,
    unwrapVaultToken,
    getTokenBalanceFromSymbol,
    getTokensByType,
  };
};
