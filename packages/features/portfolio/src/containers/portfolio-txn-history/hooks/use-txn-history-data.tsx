import { useCallback } from 'react';
import {
  useTransactionHistory,
  useSelectedNetwork,
  usePendingPnLCalculation,
} from '@notional-finance/notionable-hooks';
import { ReceivedIcon, SentIcon, TokenIcon } from '@notional-finance/icons';
import { formatTokenType, formatTokenAmount } from '@notional-finance/helpers';
import { getEtherscanTransactionLink } from '@notional-finance/util';
import { SelectedOptions } from '@notional-finance/mui';
import { useTheme } from '@mui/material';

export const useTxnHistoryData = (txnHistoryCategory: number) => {
  const theme = useTheme();
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
        label,
        txnLabel,
        underlyingAmountRealized,
        token,
        realizedPrice,
        timestamp,
        transactionHash,
        underlying,
        impliedFixedRate,
        vaultName,
      }) => {
        const assetData = formatTokenType(token);
        const isIncentive =
          bundleName === 'Transfer Incentive' ||
          bundleName === 'Transfer Secondary Incentive';

        return {
          transactionType: {
            label: label,
            caption: vaultName || txnLabel,
            IconComponent: underlyingAmountRealized.isNegative() ? (
              <SentIcon fill={theme.palette.primary.dark} />
            ) : (
              <ReceivedIcon fill={theme.palette.primary.main} />
            ),
          },
          vaultName: vaultName,
          underlyingAmount: formatTokenAmount(
            underlyingAmountRealized,
            impliedFixedRate,
            true,
            false,
            underlyingAmountRealized.isPositive(),
            4
          ),
          asset: {
            label: assetData.title,
            symbol: assetData.icon.toLowerCase(),
            caption: assetData.caption ? assetData.caption : '',
          },
          price: isIncentive
            ? '-'
            : realizedPrice.toDisplayStringWithSymbol(4, true),
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
