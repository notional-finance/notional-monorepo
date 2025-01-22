import { DataTable, SimpleToggle } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import {
  useTxnHistoryTable,
  useTxnHistoryCategory,
  useTxnHistoryDropdowns,
  useTxnHistoryData,
} from './hooks';
import { Box, styled, useMediaQuery, useTheme } from '@mui/material';
import { PORTFOLIO_CATEGORIES } from '@notional-finance/util';
import { PortfolioPageHeader } from '../../components';
import { observer } from 'mobx-react-lite';

export const PortfolioTransactionHistory = observer(() => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const rightToggleData = useTxnHistoryCategory();
  const txnHistoryCategory = rightToggleData?.toggleKey || 0;

  useTxnHistoryData(txnHistoryCategory);

  const {
    accountHistoryData,
    allCurrencyOptions,
    allAssetOrVaultOptions,
    pendingTokenData,
  } = useTxnHistoryData(txnHistoryCategory);

  const { dropdownsData, currencyOptions, assetOrVaultOptions } =
    useTxnHistoryDropdowns(
      txnHistoryCategory,
      allCurrencyOptions,
      allAssetOrVaultOptions
    );

  const { txnHistoryData, txnHistoryColumns, marketDataCSVFormatter } =
    useTxnHistoryTable(
      currencyOptions,
      assetOrVaultOptions,
      txnHistoryCategory,
      accountHistoryData
    );

  return (
    <Box>
      {isMobile && (
        <ToggleContainer>
          {rightToggleData && (
            <SimpleToggle
              tabLabels={rightToggleData.toggleOptions}
              selectedTabIndex={rightToggleData.toggleKey}
              onChange={(_, v) => rightToggleData.setToggleKey(v as number)}
            />
          )}
        </ToggleContainer>
      )}
      <PortfolioPageHeader
        category={PORTFOLIO_CATEGORIES.TRANSACTION_HISTORY}
      />
      <DataTable
        data={txnHistoryData || []}
        columns={txnHistoryColumns}
        filterBarData={dropdownsData}
        rightToggleData={rightToggleData}
        pendingMessage={
          <FormattedMessage defaultMessage={'Calculating transaction'} />
        }
        pendingTokenData={pendingTokenData}
        csvDataFormatter={marketDataCSVFormatter}
      />
    </Box>
  );
});

const ToggleContainer = styled(Box)(
  ({ theme }) => `
    margin: ${theme.spacing(2)} ${theme.spacing(2)} 0;
  `
);

export default PortfolioTransactionHistory;
