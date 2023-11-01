import { Box, useTheme } from '@mui/material';
import { FaqHeader, Faq, AreaChart, TotalRow } from '@notional-finance/mui';
import {
  LiquidationChart,
  PerformanceChart,
  TradeActionSummary,
} from '@notional-finance/trade';
import { trackEvent } from '@notional-finance/helpers';
import { useLocation } from 'react-router-dom';
import {
  useLeveragedLiquidityFaq,
  useNTokenPriceExposure,
  useSummaryState,
} from './hooks';
import { FormattedMessage } from 'react-intl';
import {
  useDebtAPY,
  useTokenHistory,
} from '@notional-finance/notionable-hooks';
import { DataTable } from '@notional-finance/mui';
import { HowItWorksFaq } from './components';
import { useTotalsData } from '../liquidity-variable/hooks/use-totals-data';

export const LiquidityLeveragedSummary = () => {
  const theme = useTheme();
  const state = useSummaryState();
  const { pathname } = useLocation();
  const {
    selectedDepositToken,
    deposit,
    collateral,
    customizeLeverage,
    collateralBalance,
    riskFactorLimit,
  } = state;
  const tokenSymbol = selectedDepositToken || '';

  const debtAPY = useDebtAPY(state);
  const { totalsData, liquidityYieldData } = useTotalsData(
    tokenSymbol,
    collateralBalance?.tokenType === 'nToken' ? collateralBalance : undefined,
    debtAPY,
    riskFactorLimit?.limit as number | undefined
  );
  const { faqs, faqHeaderLinks } = useLeveragedLiquidityFaq(tokenSymbol);
  const { data, columns } = useNTokenPriceExposure(state);
  const { apyData } = useTokenHistory(collateral);

  const apyChart = {
    id: 'apy-area-chart',
    title: collateral ? `${collateral.symbol} APY` : 'APY',
    hideTopGridLine: true,
    Component: (
      <AreaChart
        showCartesianGrid
        xAxisTickFormat="date"
        areaChartData={apyData}
        areaLineType="linear"
      />
    ),
  };

  return (
    <TradeActionSummary
      state={state}
      liquidityYieldData={customizeLeverage ? undefined : liquidityYieldData}
    >
      <PerformanceChart state={state} apyChartData={apyChart} />
      {customizeLeverage ? (
        <>
          <Faq
            sx={{ boxShadow: 'none' }}
            question={<FormattedMessage defaultMessage={'How it Works'} />}
            componentAnswer={<HowItWorksFaq tokenSymbol={tokenSymbol} />}
            questionDescription={
              <FormattedMessage
                defaultMessage={'Learn how leveraged liquidity works.'}
              />
            }
          />
          <LiquidationChart state={state} />
          <Box marginBottom={theme.spacing(5)}>
            <DataTable
              tableTitle={
                <FormattedMessage
                  defaultMessage={'n{symbol}/{symbol} Price Exposure'}
                  values={{ symbol: deposit?.symbol || '' }}
                />
              }
              stateZeroMessage={
                <FormattedMessage
                  defaultMessage={'Fill in inputs to see price exposure'}
                />
              }
              data={data}
              maxHeight={theme.spacing(40)}
              columns={columns}
            />
          </Box>
        </>
      ) : (
        <TotalRow totalsData={totalsData} />
      )}
      <Box sx={{ marginTop: theme.spacing(5) }}>
        <FaqHeader
          title={
            <FormattedMessage defaultMessage={'Leveraged Liquidity FAQ'} />
          }
          links={faqHeaderLinks}
        />
        {faqs.map(
          ({ answer, question, questionString, componentAnswer }, index) => (
            <Faq
              onClick={() =>
                trackEvent('ToolTip', {
                  path: pathname,
                  type: 'FAQ',
                  title: questionString,
                })
              }
              key={index}
              question={question}
              answer={answer}
              componentAnswer={componentAnswer}
            ></Faq>
          )
        )}
      </Box>
    </TradeActionSummary>
  );
};

export default LiquidityLeveragedSummary;
