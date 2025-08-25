import { useCallback } from 'react';
import {
  useTransactionHistory,
  useSelectedNetwork,
  usePendingPnLCalculation,
} from '@notional-finance/notionable-hooks';
import { TokenIcon } from '@notional-finance/icons';
import { formatTxnTableData } from '@notional-finance/helpers';
import { AccountHistory } from '@notional-finance/core-entities';

export const useTxnHistoryData = () => {
  const network = useSelectedNetwork();
  const pendingTokenData = usePendingPnLCalculation(network);
  const accountHistory = useTransactionHistory(network);
  const accountHistoryData =
    accountHistory?.map((data) =>
      formatTxnTableData(data as AccountHistory, network)
    ) || [];

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

  const currencyData = accountHistoryData.map(({ currency }) => ({
    id: currency,
    title: currency,
    icon: <TokenIcon size="medium" symbol={currency.toLowerCase()} />,
  }));
  const assetOrVaultData = accountHistoryData.map(({ vaultName, token }) => ({
    id: token.vaultAddress || '',
    title: vaultName || '',
  }));

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
