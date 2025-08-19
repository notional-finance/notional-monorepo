import { ObservableMap, values } from 'mobx';
import { NetworkModel } from '../NetworkModel';
import { Instance, ISimpleType } from 'mobx-state-tree';
import { TokenDefinitionModel } from '../ModelTypes';
import { getNowSeconds } from '@notional-finance/util';
import { BigNumberish } from 'ethers';
import { TokenBalance } from '../../token-balance';
import { TokenDefinition, TokenType } from '../../Definitions';

export const TokenViews = (self: Instance<typeof NetworkModel>) => {
  const getAllTokens = () => {
    const allTokens = values(
      self.tokens as unknown as ObservableMap<
        ISimpleType<string>,
        Instance<typeof TokenDefinitionModel>
      >
    ) as unknown as TokenDefinition[];

    return allTokens;
  };

  const getTokenBySymbol = (symbol: string) => {
    const t = getAllTokens().find((t) => t.symbol === symbol);
    if (!t) throw Error(`Token ${symbol} not found`);
    return t;
  };

  const getTokenByID = (id: string) => {
    const t = self.tokens.get(id.toLowerCase());
    if (!t) throw Error(`Token ${id} not found`);
    return t as TokenDefinition;
  };

  const getTokenByAddress = (address: string) => {
    const t = getAllTokens().find((t) => t.address === address);
    if (!t) throw Error(`Token ${address} not found`);
    return t;
  };

  const getVaultShare = (vaultAddress: string) => {
    const t = getAllTokens().find(
      (t) =>
        t.vaultAddress?.toLowerCase() === vaultAddress.toLowerCase() &&
        t.tokenType === 'VaultShare'
    );
    if (!t) throw Error(`VaultShare ${vaultAddress} not found`);
    return t;
  };

  const getVaultDebt = (vaultAddress: string, lendingRouter: string) => {
    const t = getAllTokens().find(
      (t) =>
        t.vaultAddress?.toLowerCase() === vaultAddress.toLowerCase() &&
        t.address === lendingRouter &&
        t.tokenType === 'VaultDebt'
    );
    if (!t) throw Error(`VaultDebt ${vaultAddress} not found`);
    return t;
  };

  const getTokenBalanceFromSymbol = (n: BigNumberish, symbol: string) => {
    const token = getTokenBySymbol(symbol);
    if (!token) throw Error(`Token ${symbol} not found`);
    return TokenBalance.from(n, token);
  };

  const getTokensByType = (tokenType: TokenType, excludeMatured = true) => {
    const t = getAllTokens().filter((t) => t.tokenType === tokenType);
    if (excludeMatured) {
      return t.filter((t) =>
        t.maturity === undefined ? true : getNowSeconds() < t.maturity
      );
    }

    return t;
  };

  const getDebtTokens = () => {
    const t = getAllTokens().filter((t) => t.tokenType === 'VaultDebt');
    return t;
  };

  return {
    getAllTokens,
    getTokenByID,
    getTokenBySymbol,
    getTokenByAddress,
    getVaultShare,
    getVaultDebt,
    getTokenBalanceFromSymbol,
    getTokensByType,
    getDebtTokens,
  };
};
