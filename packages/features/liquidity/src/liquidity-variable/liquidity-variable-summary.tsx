import { Box, useTheme } from '@mui/material';
import {
  TABLE_VARIANTS,
  FaqHeader,
  Faq,
  DataTable,
  Body,
  AreaChart,
  MultiDisplayChart,
  TotalRow,
} from '@notional-finance/mui';
import { useLocation } from 'react-router-dom';
import { trackEvent } from '@notional-finance/helpers';
import { TradeActionSummary } from '@notional-finance/trade';
import { useLiquidityFaq, useTotalsData, useReturnDriversTable } from './hooks';
import { FormattedMessage } from 'react-intl';
import { useContext } from 'react';
import { LiquidityContext } from '../liquidity';
import { HowItWorksFaq } from './components';
import { useTokenHistory } from '@notional-finance/notionable-hooks';

export const LiquidityVariableSummary = () => {
  const theme = useTheme();
  const { pathname } = useLocation();
  const { state } = useContext(LiquidityContext);
  const { selectedDepositToken, collateral, collateralBalance } = state;
  const tokenSymbol = selectedDepositToken || '';
  const { faqs, faqHeaderLinks } = useLiquidityFaq(tokenSymbol);
  const { totalsData, liquidityYieldData } = useTotalsData(
    tokenSymbol,
    collateralBalance
  );
  const { returnDriversColumns, returnDriversData, infoBoxData } =
    useReturnDriversTable();
  const { apyData, tvlData } = useTokenHistory(collateral);

  return (
    <TradeActionSummary state={state} liquidityYieldData={liquidityYieldData}>
      <MultiDisplayChart
        chartComponents={[
          {
            id: 'apy-area-chart',
            title: 'APY',
            hideTopGridLine: true,
            Component: (
              <AreaChart
                title="APY"
                showCartesianGrid
                xAxisTickFormat="date"
                areaChartData={apyData}
                areaLineType="linear"
              />
            ),
          },
          {
            id: 'tvl-area-chart',
            title: 'TVL',
            hideTopGridLine: true,
            Component: (
              <AreaChart
                title="TVL"
                showCartesianGrid
                xAxisTickFormat="date"
                yAxisTickFormat="usd"
                areaChartData={tvlData}
                areaLineType="linear"
              />
            ),
          },
        ]}
      />
      <TotalRow totalsData={totalsData} />
      <Faq
        onClick={() =>
          trackEvent('ToolTip', {
            path: pathname,
            type: 'HowItWorks',
            title: undefined,
          })
        }
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

export default LiquidityVariableSummary;
