import { useContext } from 'react';
import { Box, useTheme } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { HowItWorksFaq } from './how-it-works-faq';
import {
  DataTable,
  Faq,
  FaqHeader,
  TotalBox,
  MultiDisplayChart,
} from '@notional-finance/mui';
import {
  useLendFixedFaq,
  useTotalsData,
  useLendFixedMultiChart,
} from '../hooks';
import { LendFixedContext } from '../../lend-fixed/lend-fixed';
import {
  TradeActionSummary,
  useFixedLiquidityPoolsTable,
} from '@notional-finance/trade';

export const LendFixedTradeSummary = () => {
  const theme = useTheme();
  const context = useContext(LendFixedContext);
  const { state } = context;
  const { selectedDepositToken, deposit } = state;
  const { tableColumns, tableData } = useFixedLiquidityPoolsTable(
    selectedDepositToken,
    deposit?.currencyId
  );
  const { faqHeaderLinks, faqs } = useLendFixedFaq();
  const totalsData = useTotalsData(selectedDepositToken);
  const multiChartData = useLendFixedMultiChart();

  return (
    <TradeActionSummary state={state}>
      <MultiDisplayChart chartComponents={multiChartData} />
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

      {selectedDepositToken && (
        <Faq
          sx={{ boxShadow: 'none' }}
          question={<FormattedMessage defaultMessage={'How it Works'} />}
          componentAnswer={<HowItWorksFaq tokenSymbol={selectedDepositToken} />}
          questionDescription={
            <FormattedMessage
              defaultMessage={
                'Learn how fixed rate lending works using f{selectedDepositToken}.'
              }
              values={{
                selectedDepositToken,
              }}
            />
          }
        />
      )}
      {tableColumns.length > 0 && tableData.length > 0 && (
        <DataTable
          data={tableData}
          columns={tableColumns}
          tableTitle={
            <FormattedMessage defaultMessage={'Fixed Rate Liquidity Pools'} />
          }
        />
      )}
      <FaqHeader
        title={<FormattedMessage defaultMessage={'Fixed Lend FAQ'} />}
        links={faqHeaderLinks}
      />
      {faqs.map(({ question, answer, componentAnswer }, index) => (
        <Faq
          key={index}
          question={question}
          answer={answer}
          componentAnswer={componentAnswer}
          sx={{
            marginBottom: theme.spacing(2),
            boxShadow: theme.shape.shadowStandard,
          }}
        />
      ))}
    </TradeActionSummary>
  );
};

export default LendFixedTradeSummary;
