import { useContext } from 'react';
import { Box, useTheme } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import {
  // DataTable,
  Faq,
  FaqHeader,
  TotalBox,
  // InteractiveAreaChart,
} from '@notional-finance/mui';
import { useLendVariableFaq } from '../hooks';
import { LendVariableContext } from '../../lend-variable/lend-variable';
import {
  TradeActionSummary,
  useVariableTotals,
  // useMaturitySelect,
  // useInteractiveMaturityChart,
  // useFixedLiquidityPoolsTable,
} from '@notional-finance/trade';

export const LendVariableTradeSummary = () => {
  const theme = useTheme();
  const context = useContext(LendVariableContext);
  const { state } = context;
  const { faqs, faqHeaderLinks } = useLendVariableFaq(
    state.selectedDepositToken
  );
  const totalsData = useVariableTotals(state);
  // const { selectedDepositToken, deposit } = state;

  // const { selectedfCashId, onSelect } = useMaturitySelect(
  //   'Collateral',
  //   context
  // );
  // const { areaChartData, legendData, chartToolTipData } =
  //   useInteractiveMaturityChart(deposit?.currencyId);
  // const { tableColumns, tableData } = useFixedLiquidityPoolsTable(
  //   selectedDepositToken,
  //   deposit?.currencyId
  // );

  return (
    <TradeActionSummary state={state}>
      {/* {areaChartData.length > 0 && (
        <InteractiveAreaChart
          interactiveAreaChartData={areaChartData}
          onSelectMarketKey={onSelect}
          selectedMarketKey={selectedfCashId}
          legendData={legendData}
          chartToolTipData={chartToolTipData}
        />
      )} */}
      <Box
        sx={{
          display: 'flex',
          gap: theme.spacing(5),
          marginBottom: theme.spacing(3),
          marginTop: theme.spacing(3),
        }}
      >
        {totalsData.map(({ title, value }, index) => (
          <TotalBox title={title} value={value} key={index} />
        ))}
      </Box>
      {/* {tableColumns.length > 0 && tableData.length > 0 && (
        <DataTable
          data={tableData}
          columns={tableColumns}
          tableTitle={
            <FormattedMessage defaultMessage={'Fixed Rate Liquidity Pools'} />
          }
        />
      )} */}
      <FaqHeader
        title={<FormattedMessage defaultMessage={'Variable Lend FAQ'} />}
        links={faqHeaderLinks}
      />
      {faqs.map(({ question, answer, componentAnswer }, index) => (
        <Faq
          key={index}
          question={question}
          answer={answer}
          componentAnswer={componentAnswer}
        />
      ))}
    </TradeActionSummary>
  );
};

export default LendVariableTradeSummary;
