import { Network, getEtherscanTransactionLink } from '@notional-finance/util';
import { ReceivedIcon, SentIcon } from '@notional-finance/icons';
import { formatTokenAmount, formatTokenType } from '@notional-finance/helpers';
import { useMemo } from 'react';
import { useTheme } from '@mui/material';

export const useFormattedData = (data: any[], network?: Network) => {
  const theme = useTheme();
  const formattedData = useMemo(() => {
    return data.map(
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
  }, [data, network, theme]);

  return formattedData;
};
