import { Box, useTheme } from '@mui/material';
import {
  TABLE_VARIANTS,
  FaqHeader,
  Faq,
  TotalBox,
  DataTable,
  Body,
  ChartContainer,
  AreaChart,
  MultiDisplayChart,
} from '@notional-finance/mui';
import { TradeActionSummary } from '@notional-finance/trade';
import {
  useLiquidityFaq,
  useTotalsData,
  useReturnDriversTable,
} from '../hooks';
import { FormattedMessage } from 'react-intl';
import { useContext } from 'react';
import { LiquidityContext } from '../liquidity-variable';
import { HowItWorksFaq } from './how-it-works-faq';
import { useTokenHistory } from '@notional-finance/notionable-hooks';

export const LiquidityVariableSummary = () => {
  const theme = useTheme();
  const { state } = useContext(LiquidityContext);
  const { selectedDepositToken, collateral } = state;
  const tokenSymbol = selectedDepositToken || '';
  const { faqs, faqHeaderLinks } = useLiquidityFaq(tokenSymbol);
  const totalsData = useTotalsData(tokenSymbol);
  const { returnDriversColumns, returnDriversData, infoBoxData } =
    useReturnDriversTable();
  const { apyData, tvlData } = useTokenHistory(collateral);

  return (
    <TradeActionSummary state={state}>
      <MultiDisplayChart
        chartComponents={[
          {
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
          },
          {
            id: 'tvl-area-chart',
            title: 'TVL',
            Component: (
              <ChartContainer>
                <AreaChart
                  showCartesianGrid
                  xAxisTickFormat="date"
                  areaChartData={tvlData}
                  areaLineType="linear"
                />
              </ChartContainer>
            ),
          },
        ]}
      />
      <Box
        sx={{
          display: 'flex',
          gap: theme.spacing(5),
          marginBottom: theme.spacing(3),
          marginTop: theme.spacing(3),
        }}
      >
        {totalsData.map(({ title, value, Icon }, index) => (
          <TotalBox title={title} value={value} key={index} Icon={Icon} />
        ))}
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
      <DataTable
        tableTitle={
          <FormattedMessage
            defaultMessage={'n{tokenSymbol} Return Drivers'}
            values={{
              tokenSymbol,
            }}
          />
        }
        infoBoxData={infoBoxData}
        tableTitleSubText={
          <>
            <Body
              sx={{
                marginTop: theme.spacing(2),
                marginBottom: theme.spacing(1),
              }}
            >
              <FormattedMessage
                defaultMessage={
                  'n{tokenSymbol} earns returns from interest accrual on its assets, trading fees, and NOTE incentives.'
                }
                values={{ tokenSymbol }}
              />
            </Body>
            <Body>
              <FormattedMessage
                defaultMessage={
                  'This table shoes how much Prime {tokenSymbol} and f{tokenSymbol} are held in the nToken account, their APYs, and the APY from trading fees and NOTE incentives.'
                }
                values={{ tokenSymbol }}
              />
            </Body>
          </>
        }
        columns={returnDriversColumns}
        data={returnDriversData}
        tableVariant={TABLE_VARIANTS.TOTAL_ROW}
      />
      <Box sx={{ marginTop: theme.spacing(5) }}>
        <FaqHeader
          title={<FormattedMessage defaultMessage={'Provide Liquidity FAQ'} />}
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

export default LiquidityVariableSummary;
