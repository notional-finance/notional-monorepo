import { Box, useTheme } from '@mui/material';
import { FaqHeader, Faq, AreaChart, TotalRow } from '@notional-finance/mui';
import {
  LiquidationChart,
  PerformanceChart,
  TradeActionSummary,
} from '@notional-finance/trade';
import {
  useLeveragedNTokenPositions,
  useLiquidityFaq,
  useNTokenPriceExposure,
} from './hooks';
import { FormattedMessage } from 'react-intl';
import { useContext } from 'react';
import { LiquidityContext } from '../liquidity';
import {
  useDebtAPY,
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
    tradeType,
    debt,
  } = state;
  const tokenSymbol = selectedDepositToken || '';
  const { currentPosition } = useLeveragedNTokenPositions(selectedDepositToken);
  const nTokenBalance =
    tradeType === 'LeveragedNToken'
      ? collateralBalance
      : currentPosition?.asset;
  const debtOverride =
    tradeType === 'RollDebt' && !debt ? currentPosition?.debt.token : undefined;

  const debtAPY = useDebtAPY(state, debtOverride);
  const { totalsData, liquidityYieldData } = useTotalsData(
    tokenSymbol,
    nTokenBalance,
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
