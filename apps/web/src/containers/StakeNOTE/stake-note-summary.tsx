import { useContext } from 'react';
import { NOTEContext } from './index';
import { Box, useTheme } from '@mui/material';
import { TradeActionSummary } from '@notional-finance/trade';
import {
  MultiDisplayChart,
  AreaChart,
  TotalRow,
  FaqHeader,
  Faq,
  DataTable,
  TotalBoxProps,
} from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import { SECONDS_IN_DAY, TRACKING_EVENTS } from '@notional-finance/util';
import { trackEvent } from '@notional-finance/helpers';
import { useLocation } from 'react-router';
import { useStakingFaq } from './use-staking-faq';
import {
  StakedNoteData,
  useNotePrice,
} from '@notional-finance/notionable-hooks';
import { FiatSymbols } from '@notional-finance/core-entities';
import { useReinvestmentData } from './use-reinvestment-data';
import { useStakedNote } from '../NoteView/staked-note/use-staked-note';
import { useAppState } from '@notional-finance/notionable';

export const StakeNOTESummary = ({
  stakedNoteData,
}: {
  stakedNoteData: StakedNoteData | undefined;
}) => {
  const theme = useTheme();
  const { state } = useContext(NOTEContext);
  const { pathname } = useLocation();
  const { faqs, faqHeaderLinks } = useStakingFaq();
  const { baseCurrency } = useAppState();
  const {
    historicalSNOTEPrice,
    historicalSNOTEAPY,
    annualizedRewardRate,
    totalSNOTEValue,
    currentSNOTEYield,
  } = useStakedNote(stakedNoteData, 90 * SECONDS_IN_DAY);
  const { reinvestmentTableColumns, reinvestmentTableData } =
    useReinvestmentData();
  const { notePrice } = useNotePrice();
  const totalsData: TotalBoxProps[] = [
    {
      title: <FormattedMessage defaultMessage={'TVL'} />,
      prefix: FiatSymbols[baseCurrency],
      value: totalSNOTEValue?.toFiat(baseCurrency).toFloat() || '-',
      decimals: 2,
    },
    {
      title: <FormattedMessage defaultMessage={'Annual Reward Rate'} />,
      prefix: FiatSymbols[baseCurrency],
      value: annualizedRewardRate?.toFiat(baseCurrency).toFloat() || '-',
      decimals: 2,
    },
    {
      title: <FormattedMessage defaultMessage={'NOTE Price'} />,
      prefix: FiatSymbols[baseCurrency],
      value: notePrice?.toFiat(baseCurrency).toFloat() || '-',
      decimals: 2,
    },
  ];

  return (
    <TradeActionSummary state={state} stakedNOTEApy={currentSNOTEYield}>
      <MultiDisplayChart
        chartComponents={[
          {
            id: 'apy-area-chart',
            title: 'APY',
            hideTopGridLine: true,
            Component: (
              <AreaChart
                title="APY"
                xAxisTickFormat="date"
                showCartesianGrid
                yAxisTickFormat="percent"
                areaChartData={historicalSNOTEAPY.map(([d, a]) => ({
                  timestamp: d.getTime() / 1000,
                  area: a,
                }))}
              />
            ),
          },
          {
            id: 'price-area-chart',
            title: 'sNOTE Price',
            hideTopGridLine: true,
            Component: (
              <AreaChart
                title={'sNOTE Price'}
                showCartesianGrid
                xAxisTickFormat="date"
                yAxisTickFormat="double"
                yAxisDomain={['dataMin * 0.95', 'dataMax * 1.05']}
                areaChartData={historicalSNOTEPrice.map(([d, p]) => ({
                  timestamp: d.getTime() / 1000,
                  area: p,
                }))}
              />
            ),
          },
        ]}
      />
      <TotalRow totalsData={totalsData} />
      <Box
        sx={{
          marginBottom: theme.spacing(5),
          marginTop: theme.spacing(5),
        }}
      >
        <DataTable
          tableTitle={
            <FormattedMessage defaultMessage={'sNOTE Reinvestment History'} />
          }
          data={reinvestmentTableData}
          maxHeight={theme.spacing(51)}
          columns={reinvestmentTableColumns}
        />
      </Box>
      <Box sx={{ marginTop: theme.spacing(5) }}>
        <FaqHeader
          title={<FormattedMessage defaultMessage={'Staked NOTE FAQ'} />}
          links={faqHeaderLinks}
        />
        {faqs.map(({ answer, question, questionString }, index) => (
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
          />
        ))}
      </Box>
    </TradeActionSummary>
  );
};
