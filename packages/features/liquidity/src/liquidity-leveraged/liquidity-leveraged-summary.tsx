import { Box, useTheme } from '@mui/material';
import { FaqHeader, Faq, AreaChart } from '@notional-finance/mui';
import {
  FaqHeader,
  Faq,
  AreaChart,
  ChartContainer,
  TotalRow,
} from '@notional-finance/mui';
import {
  LiquidationChart,
  PerformanceChart,
  TradeActionSummary,
} from '@notional-finance/trade';
import { useLiquidityFaq, useNTokenPriceExposure } from './hooks';
import { FormattedMessage } from 'react-intl';
import { useContext } from 'react';
import { LiquidityContext } from '../liquidity';
import {
  useAllMarkets,
  useTokenHistory,
} from '@notional-finance/notionable-hooks';
import { DataTable } from '@notional-finance/mui';
import { HowItWorksFaq } from './components';
import { useTotalsData } from '../liquidity-variable/hooks/use-totals-data';

export const LiquidityLeveragedSummary = () => {
  const theme = useTheme();
  const { state } = useContext(LiquidityContext);
  const {
    selectedDepositToken,
    deposit,
    collateral,
    customizeLeverage,
    collateralBalance,
    debtOptions,
    debt,
  } = state;
  const tokenSymbol = selectedDepositToken || '';
  const { nonLeveragedYields } = useAllMarkets();
  const debtAPY = !customizeLeverage
    ? debtOptions?.find((d) => d.token.id === debt?.id)?.interestRate ||
      nonLeveragedYields.find((y) => y.token.id === debt?.id)?.totalAPY
    : undefined;
  const { totalsData, liquidityYieldData } = useTotalsData(
    tokenSymbol,
    collateralBalance,
    debtAPY
  );
  const { faqs, faqHeaderLinks } = useLiquidityFaq(tokenSymbol);
  const { data, columns } = useNTokenPriceExposure(state);
  const { apyData } = useTokenHistory(collateral);

  const apyChart = {
    id: 'apy-area-chart',
    title: 'APY',
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
    <TradeActionSummary state={state} liquidityYieldData={liquidityYieldData}>
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
        {faqs.map(({ answer, question, componentAnswer }, index) => (
          <Faq
            key={index}
            question={question}
            answer={answer}
            componentAnswer={componentAnswer}
          ></Faq>
        ))}
      </Box>
    </TradeActionSummary>
  );
};

export default LiquidityLeveragedSummary;
