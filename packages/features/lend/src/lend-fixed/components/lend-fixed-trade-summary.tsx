import { useContext } from 'react';
import { Box, useTheme } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { HowItWorksFaq } from './how-it-works-faq';
import { trackEvent } from '@notional-finance/helpers';
import { TRACKING_EVENTS } from '@notional-finance/util';
import { useLocation } from 'react-router-dom';
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
import { useAppStore } from '@notional-finance/notionable-hooks';
import { observer } from 'mobx-react-lite';

const LendFixedTradeSummary = () => {
  const theme = useTheme();
  const { pathname } = useLocation();
  const context = useContext(LendFixedContext);
  const { state } = context;
  const { selectedDepositToken, deposit, selectedNetwork, collateral } = state;
  const { tableColumns, tableData } = useFixedLiquidityPoolsTable(deposit);
  const { faqHeaderLinks, faqs } = useLendFixedFaq(selectedNetwork);
  const { baseCurrency } = useAppStore();
  const totalsData = useTotalsData(deposit, collateral, baseCurrency);
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
        {totalsData.map(({ title, value, prefix, suffix, decimals }, index) => (
          <TotalBox
            title={title}
            value={value}
            key={index}
            prefix={prefix}
            suffix={suffix}
            decimals={decimals}
          />
        ))}
      </Box>

      {selectedDepositToken && (
        <Faq
          onClick={() =>
            trackEvent(TRACKING_EVENTS.TOOL_TIP, {
              path: pathname,
              type: TRACKING_EVENTS.HOW_IT_WORKS,
              title: undefined,
            })
          }
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
      {faqs.map(
        ({ question, questionString, answer, componentAnswer }, index) => (
          <Faq
            onClick={() =>
              trackEvent(TRACKING_EVENTS.TOOL_TIP, {
                path: pathname,
                type: TRACKING_EVENTS.FAQ,
                title: questionString,
              })
            }
            key={index}
            question={question}
            answer={answer}
            componentAnswer={componentAnswer}
            sx={{
              marginBottom: theme.spacing(2),
              boxShadow: theme.shape.shadowStandard,
            }}
          />
        )
      )}
    </TradeActionSummary>
  );
};

export default observer(LendFixedTradeSummary);
