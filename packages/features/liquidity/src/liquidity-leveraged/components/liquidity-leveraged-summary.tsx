import { Box, useTheme } from '@mui/material';
import {
  FaqHeader,
  Faq,
  AreaChart,
  ChartContainer,
} from '@notional-finance/mui';
import {
  LiquidationChart,
  PerformanceChart,
  TradeActionSummary,
} from '@notional-finance/trade';
import { useLiquidityFaq, useNTokenPriceExposure } from '../hooks';
import { FormattedMessage } from 'react-intl';
import { useContext } from 'react';
import { LeveragedLiquidityContext } from '../liquidity-leveraged';
import { useTokenHistory } from '@notional-finance/notionable-hooks';
import { DataTable } from '@notional-finance/mui';
import { HowItWorksFaq } from './how-it-works-faq';

export const LiquidityLeveragedSummary = () => {
  const theme = useTheme();
  const { state } = useContext(LeveragedLiquidityContext);
  const { selectedDepositToken, deposit, collateral } = state;
  const tokenSymbol = selectedDepositToken || '';
  const { faqs, faqHeaderLinks } = useLiquidityFaq(tokenSymbol);
  const { data, columns } = useNTokenPriceExposure(state);
  const { apyData } = useTokenHistory(collateral);

  const apyChart = {
    id: 'apy-area-chart',
    title: 'APY',
    Component: (
      <ChartContainer>
        <AreaChart
          showCartesianGrid
          xAxisTickFormat="date"
          areaChartData={apyData}
          areaLineType="linear"
        />
      </ChartContainer>
    ),
  };

  return (
    <TradeActionSummary state={state}>
      <PerformanceChart state={state} apyChartData={apyChart} />
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
      <Faq
        sx={{ boxShadow: 'none' }}
        question={<FormattedMessage defaultMessage={'How it Works'} />}
        componentAnswer={<HowItWorksFaq tokenSymbol={tokenSymbol} />}
        questionDescription={
          <FormattedMessage
            defaultMessage={'Learn how n{tokenSymbol} works and what it does.'}
            values={{
              tokenSymbol,
            }}
          />
        }
      />
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
