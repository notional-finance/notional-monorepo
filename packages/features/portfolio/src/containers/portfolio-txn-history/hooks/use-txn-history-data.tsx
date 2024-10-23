import { useCallback } from 'react';
import {
  useTransactionHistory,
  useSelectedNetwork,
  usePendingPnLCalculation,
} from '@notional-finance/notionable-hooks';
import { TokenIcon } from '@notional-finance/icons';
import { formatTokenType } from '@notional-finance/helpers';
import { SelectedOptions } from '@notional-finance/mui';
import { formatTxnTableData } from '@notional-finance/helpers';
import { AccountHistory } from '@notional-finance/core-entities';

export const useTxnHistoryData = (txnHistoryCategory: number) => {
  let assetOrVaultData: SelectedOptions[] = [];
  let currencyData: SelectedOptions[] = [];
  const network = useSelectedNetwork();
  const pendingTokenData = usePendingPnLCalculation(network);
  const accountHistory = useTransactionHistory(network);

  const allAccountHistoryData = accountHistory
    .sort((x, y) => y.timestamp - x.timestamp)
    .map((data) => formatTxnTableData(data as AccountHistory, network));

  let accountHistoryData: typeof allAccountHistoryData = [];
  const removeDuplicateObjects = useCallback((data) => {
    const uniqueObjects = {};
    const filteredArray = data.filter(({ id }) => {
      if (!uniqueObjects[id]) {
        uniqueObjects[id] = true;
        return true;
      }
      return false;
    });

    return filteredArray;
  }, []);

  if (txnHistoryCategory === 0) {
    accountHistoryData = allAccountHistoryData.filter(
      ({ vaultName }) => !vaultName
    );
    currencyData = accountHistoryData.map(({ currency }) => ({
      id: currency,
      title: currency,
      icon: <TokenIcon size="medium" symbol={currency.toLowerCase()} />,
    }));

    assetOrVaultData = accountHistoryData.map(({ token }) => {
      const tokenData = formatTokenType(token);
      return {
        id: token.id,
        title: tokenData.title,

        icon: <TokenIcon size="medium" symbol={tokenData.icon.toLowerCase()} />,
      };
    });
  }

  if (txnHistoryCategory === 1) {
    accountHistoryData = allAccountHistoryData.filter(
      ({ vaultName }) => vaultName
    );
    currencyData = accountHistoryData.map(({ currency }) => ({
      id: currency,
      title: currency,
      icon: <TokenIcon size="medium" symbol={currency.toLowerCase()} />,
    }));
    assetOrVaultData = accountHistoryData.map(({ vaultName, token }) => ({
      id: token.vaultAddress || '',
      title: vaultName || '',
    }));
  }

  const allCurrencyOptions = removeDuplicateObjects(currencyData);
  const allAssetOrVaultOptions = removeDuplicateObjects(assetOrVaultData);

  return {
    accountHistoryData,
    allCurrencyOptions,
    allAssetOrVaultOptions,
    pendingTokenData,
  };
};

export default useTxnHistoryData;
