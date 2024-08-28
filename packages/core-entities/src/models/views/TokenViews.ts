import { ObservableMap, values } from 'mobx';
import { NetworkModel } from '../NetworkModel';
import { Instance, ISimpleType } from 'mobx-state-tree';
import { TokenDefinitionModel } from '../ModelTypes';
import {
  AssetType,
  encodeERC1155Id,
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
    return getAllTokens().find((t) => t.symbol === symbol);
  };

  const getTokenByAddress = (address: string) => {
    return getAllTokens().find((t) => t.address === address);
  };

  const getTokenByType = (currencyId?: number, tokenType?: string) => {
    return getAllTokens().find(
      (t) => t.currencyId === currencyId && t.tokenType === tokenType
    );
  };

  const getPrimeCash = (currencyId?: number) => {
    return getTokenByType(currencyId, 'PrimeCash');
  };

  const getPrimeDebt = (currencyId?: number) => {
    return getTokenByType(currencyId, 'PrimeDebt');
  };

  const getNToken = (currencyId?: number) => {
    return getTokenByType(currencyId, 'nToken');
  };

  const getUnderlying = (currencyId?: number) => {
    return getTokenByType(currencyId, 'Underlying');
  };

  const getVaultShare = (vaultAddress: string, maturity: number) => {
    return getAllTokens().find(
      (t) =>
        t.vaultAddress?.toLowerCase() === vaultAddress.toLowerCase() &&
        t.maturity === maturity &&
        t.tokenType === 'VaultShare'
    );
  };

  const getVaultDebt = (vaultAddress: string, maturity: number) => {
    return getAllTokens().find(
      (t) =>
        t.vaultAddress?.toLowerCase() === vaultAddress.toLowerCase() &&
        t.maturity === maturity &&
        t.tokenType === 'VaultDebt'
    );
  };

  const getVaultCash = (vaultAddress: string, maturity: number) => {
    return getAllTokens().find(
      (t) =>
        t.vaultAddress?.toLowerCase() === vaultAddress.toLowerCase() &&
        t.maturity === maturity &&
        t.tokenType === 'VaultCash'
    );
  };

  const unwrapVaultToken = (token: Instance<typeof TokenDefinitionModel>) => {
    if (!token.currencyId) {
      return token;
    } else if (
      token.tokenType === 'VaultDebt' &&
      token.maturity &&
      token.maturity !== PRIME_CASH_VAULT_MATURITY
    ) {
      return self.tokens.get(
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

  return {
    getAllTokens,
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
  };
};
