import { useCallback } from 'react';
import { TXN_HISTORY_TYPE } from '@notional-finance/util';
import {
  useTransactionHistory,
  useSelectedNetwork,
  usePendingPnLCalculation,
} from '@notional-finance/notionable-hooks';
import { TokenIcon } from '@notional-finance/icons';
import {
  formatTokenType,
  formatTokenAmount,
  formatNumber,
} from '@notional-finance/helpers';
import { getEtherscanTransactionLink } from '@notional-finance/util';
import { SelectedOptions } from '@notional-finance/mui';

export const useTxnHistoryData = (txnHistoryCategory: number) => {
  let assetOrVaultData: SelectedOptions[] = [];
  let currencyData: SelectedOptions[] = [];

  const network = useSelectedNetwork();
  const pendingTokenData = usePendingPnLCalculation(network);
  const accountHistory = useTransactionHistory(network);

  const allAccountHistoryData = accountHistory
    .sort((x, y) => y.timestamp - x.timestamp)
    .map(
      ({
        bundleName,
        underlyingAmountRealized,
        tokenAmount,
        token,
        realizedPrice,
        timestamp,
        transactionHash,
        underlying,
        impliedFixedRate,
        vaultName,
      }) => {
        const assetData = formatTokenType(token);
        return {
          transactionType: {
            label: bundleName,
            symbol: underlying.symbol.toLowerCase(),
          },
          vaultName: vaultName,
          underlyingAmount: {
            data: [
              {
                displayValue:
                  underlyingAmountRealized.toDisplayStringWithSymbol(3, true),
                isNegative: underlyingAmountRealized.isNegative(),
              },
            ],
          },
          assetAmount: formatTokenAmount(tokenAmount, impliedFixedRate),
          asset: {
            label: assetData.title,
            symbol: assetData.icon.toLowerCase(),
            caption: assetData.caption ? assetData.caption : '',
          },
          price: formatNumber(realizedPrice.toFloat(), 2),
          time: timestamp,
          txLink: {
            hash: transactionHash,
            href: getEtherscanTransactionLink(transactionHash, network),
          },
          currency: underlying.symbol,
          token: token,
        };
      }
    );

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
