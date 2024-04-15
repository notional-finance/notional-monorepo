import { useCallback } from 'react';
import { FormattedMessage } from 'react-intl';
import {
  InfiniteScrollDataTable,
  H1,
  ScrollToTop,
} from '@notional-finance/mui';
import { useAnalyticsTable } from './hooks/use-analytics-table';
import { Registry } from '@notional-finance/core-entities';
import { Network } from '@notional-finance/util';
import { StackIcon } from '@notional-finance/icons';
import { useNetworkToggle } from './hooks/use-network-toggle';
import { useTheme, Box, styled } from '@mui/material';
import { colors } from '@notional-finance/styles';
import { formatTxnTableData } from '@notional-finance/helpers';

export const NetworkTransactionsView = () => {
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
    return data.finalResults[network].map((allTxnData) =>
      formatTxnTableData(allTxnData, network)
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
          maxWidth: theme.spacing(180),
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
  max-width: ${theme.spacing(180)};
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

export default NetworkTransactionsView;
