import { useCallback } from 'react';
import { TXN_HISTORY_TYPE } from '@notional-finance/shared-config';
import {
  useTransactionHistory,
  useSelectedNetwork,
} from '@notional-finance/notionable-hooks';
import { TokenIcon } from '@notional-finance/icons';
import {
  getEtherscanLink,
  formatTokenType,
  formatTokenAmount,
  formatNumber,
} from '@notional-finance/helpers';

export const useTxnHistoryData = (txnHistoryType: TXN_HISTORY_TYPE) => {
  let accountHistoryData: any[] = [];
  let assetOrVaultData: any[] = [];
  let currencyData: any[] = [];

  const accountHistory = useTransactionHistory();
  const selectedNetwork = useSelectedNetwork();

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
          underlyingAmount: underlyingAmountRealized.toDisplayStringWithSymbol(
            3,
            true
          ),
          assetAmount: formatTokenAmount(tokenAmount, impliedFixedRate),
          asset: {
            label: assetData.title,
            symbol: assetData.title.toLowerCase(),
            caption: assetData.caption ? assetData.caption : '',
          },
          price: formatNumber(realizedPrice.toFloat(), 2),
          time: timestamp,
          txLink: {
            hash: transactionHash,
            href: getEtherscanLink(transactionHash, selectedNetwork),
          },
          currency: underlying.symbol,
          token: token,
        };
      }
    );

  const removeDuplicateObjects = useCallback((data) => {
    const uniqueObjects = {};
    const filteredArray = data.filter(({ title }) => {
      if (!uniqueObjects[title]) {
        uniqueObjects[title] = true;
        return true;
      }
      return false;
    });

    return filteredArray;
  }, []);

  if (txnHistoryType === TXN_HISTORY_TYPE.PORTFOLIO_HOLDINGS) {
    accountHistoryData = allAccountHistoryData.filter(
      ({ vaultName }) => !vaultName
    );
    currencyData = accountHistoryData.map(({ currency }, index) => ({
      id: index.toString(),
      title: currency,
      icon: <TokenIcon size="medium" symbol={currency.toLowerCase()} />,
    }));

    assetOrVaultData = accountHistoryData.map(({ token }, index) => {
      const tokenData = formatTokenType(token);
      return {
        id: index.toString(),
        title: tokenData.title,
        icon: (
          <TokenIcon size="medium" symbol={tokenData.title.toLowerCase()} />
        ),
      };
    });
  }

  if (txnHistoryType === TXN_HISTORY_TYPE.LEVERAGED_VAULT) {
    accountHistoryData = allAccountHistoryData.filter(
      ({ vaultName }) => vaultName
    );
    currencyData = accountHistoryData.map(({ currency }, index) => ({
      id: index.toString(),
      title: currency,
      icon: <TokenIcon size="medium" symbol={currency.toLowerCase()} />,
    }));
    assetOrVaultData = accountHistoryData.map(({ vaultName }, index) => ({
      id: index.toString(),
      title: vaultName,
    }));
  }

  const allCurrencyOptions = removeDuplicateObjects(currencyData);
  const allAssetOrVaultOptions = removeDuplicateObjects(assetOrVaultData);

  return { accountHistoryData, allCurrencyOptions, allAssetOrVaultOptions };
};

export default useTxnHistoryData;
