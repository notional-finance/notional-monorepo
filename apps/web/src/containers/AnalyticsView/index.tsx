import { useCallback } from 'react';
import { FormattedMessage } from 'react-intl';
import {
  InfiniteScrollDataTable,
  H1,
  ScrollToTop,
} from '@notional-finance/mui';
import { useAnalyticsTable } from './hooks/use-analytics-table';
import { Registry } from '@notional-finance/core-entities';
import { Network, getEtherscanTransactionLink } from '@notional-finance/util';
import { ReceivedIcon, SentIcon, StackIcon } from '@notional-finance/icons';
import { formatTokenAmount, formatTokenType } from '@notional-finance/helpers';
import { useNetworkToggle } from './hooks/use-network-toggle';
import { useTheme, Box, styled } from '@mui/material';
import { colors } from '@notional-finance/styles';

export const AnalyticsView = () => {
  const theme = useTheme();
  const networkToggleData = useNetworkToggle();
  const network =
    networkToggleData.toggleKey === 0 ? Network.arbitrum : Network.mainnet;
  const { columns } = useAnalyticsTable();
  const apiCallback = useCallback(
    (fetchCount) =>
      Registry.getAnalyticsRegistry().getNetworkTransactions(
        network,
        fetchCount
      ),
    [network]
  );

  const handleDataFormatting = (data) => {
    return data.finalResults[network].map(
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
  };

  return (
    <Box sx={{ marginBottom: theme.spacing(20) }}>
      <ScrollToTop />
      <Background>
        <StyledTopContent>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: theme.spacing(2),
            }}
          >
            <StackIcon
              className="color-fill"
              sx={{
                height: theme.spacing(6),
                width: theme.spacing(6),
                fill: colors.white,
                stroke: 'transparent',
              }}
            />
            <Title
              gutter="default"
              sx={{ marginLeft: theme.spacing(3), marginBottom: '0px' }}
            >
              <FormattedMessage defaultMessage={'All Transactions'} />
            </Title>
          </Box>
        </StyledTopContent>
      </Background>
      <Box
        sx={{
          padding: theme.spacing(5),
          paddingTop: '0px',
          maxWidth: theme.spacing(167),
          margin: 'auto',
          marginTop: `-${theme.spacing(30)}`,
        }}
      >
        <InfiniteScrollDataTable
          networkToggleData={networkToggleData}
          handleDataFormatting={handleDataFormatting}
          columns={columns}
          network={network}
          apiCallback={apiCallback}
        />
      </Box>
    </Box>
  );
};

const StyledTopContent = styled(Box)(
  ({ theme }) => `
  width: 100%;
  padding: ${theme.spacing(5)};
  max-width: ${theme.spacing(167)};
  display: flex;
  flex-direction: column;
  margin: auto;
  margin-top: ${theme.spacing(18.75)};
  ${theme.breakpoints.down('lg')} {
    margin-left: ${theme.spacing(6)};
    margin-right: ${theme.spacing(6)};
  }
  ${theme.breakpoints.down('sm')} {
    display: none;
  }
`
);

const Background = styled(Box)(
  ({ theme }) => `
  background: linear-gradient(90deg, #053542 28.68%, #06657E 126.35%);
  height: ${theme.spacing(69)};
  display: flex;
  align-items: center;
  min-width: 100%;
  ${theme.breakpoints.down('md')} {
    height: ${theme.spacing(94)};
  }
  ${theme.breakpoints.down('sm')} {
    display: none;
  }
`
);

const Title = styled(H1)(
  ({ theme }) => `
  color: ${colors.white};
  display: flex;
  align-items: center;
  ${theme.breakpoints.down('sm')} {
    font-size: 36px;
  }
`
);

export default AnalyticsView;
