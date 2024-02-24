import { Box, useTheme } from '@mui/material';
import { DataTable, Button } from '@notional-finance/mui';
import { defineMessages, FormattedMessage } from 'react-intl';
import { EmptyPortfolio } from '../../components';
import { PORTFOLIO_ACTIONS } from '@notional-finance/shared-config';
import { useMoneyMarketTable } from './hooks';
import { PortfolioParams } from '../../portfolio-feature-shell';
import { useParams } from 'react-router-dom';

const actionLabels = defineMessages({
  convertCash: {
    defaultMessage: 'Convert Cash to nTokens',
    description: 'button text',
  },
  repayCash: {
    defaultMessage: 'Repay Cash Debt',
    description: 'button text',
  },
  withdrawCash: {
    defaultMessage: 'Withdraw Cash',
    description: 'button text',
  },
});

export const PortfolioMoneyMarket = () => {
  const theme = useTheme();
  const { category } = useParams<PortfolioParams>();
  const { moneyMarketData, moneyMarketColumns, initialState, setExpandedRows } =
    useMoneyMarketTable();

  const MoneyMarketAction = ({
    row,
  }: {
    row: { original: typeof moneyMarketData[number] };
  }) => {
    const { original } = row;
    const actionLink = original['isNegative']
      ? `/portfolio/${category}/${PORTFOLIO_ACTIONS.REPAY_CASH_DEBT}?symbol=${original.currency.underlyingSymbol}`
      : `/portfolio/${category}/${PORTFOLIO_ACTIONS.CONVERT_CASH}?symbol=${original.currency.symbol}`;
    const buttonLabel = original['isNegative']
      ? actionLabels.repayCash
      : actionLabels.convertCash;

    return (
      <Box sx={{ display: 'flex' }}>
        <Box sx={{ padding: theme.spacing(3) }}>
          <Button size="large" to={actionLink}>
            <FormattedMessage {...buttonLabel} />
          </Button>
        </Box>
        {!original['isNegative'] && (
          <Box sx={{ padding: theme.spacing(3) }}>
            <Button
              size="large"
              to={`/portfolio/${category}/${PORTFOLIO_ACTIONS.WITHDRAW_CASH}?symbol=${original.currency.symbol}`}
            >
              <FormattedMessage {...actionLabels.withdrawCash} />
            </Button>
          </Box>
        )}
      </Box>
    );
  };

  return moneyMarketData.length ? (
    <DataTable
      data={moneyMarketData}
      columns={moneyMarketColumns}
      CustomRowComponent={MoneyMarketAction}
      initialState={initialState}
      setExpandedRows={setExpandedRows}
    />
  ) : (
    <EmptyPortfolio />
  );
};

export default PortfolioMoneyMarket;
