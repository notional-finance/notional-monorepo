import { Box, styled, Typography } from '@mui/material';
import { PortfolioNetworkSelector } from '@notional-finance/wallet';
import { CountUp, H3, H5, MultiDisplayChart } from '@notional-finance/mui';
import LineChart from '@notional-finance/mui/lib/line-chart/line-chart';
import { useTotalsChart } from '@notional-finance/portfolio-feature-shell/containers/portfolio-overview/hooks';
import {
  useAccountReady,
  useAppStore,
  useSelectedNetwork,
} from '@notional-finance/notionable-hooks';
import { getDateString, SECONDS_IN_DAY } from '@notional-finance/util';
import { BarChartIcon } from '@notional-finance/icons';

import Header from './components/header';
import InfoBox from './components/info-box';
import DataSection from './components/data-section';
import FAQSection from './components/faq-section';
import InputContainer from './components/input-container';

const TransactionScreen = () => {
  const network = useSelectedNetwork();
  const isAccountReady = useAccountReady(network);
  const { baseCurrency, isMobileView } = useAppStore();

  const { barChartData, barConfig, totalsData } = useTotalsChart(
    baseCurrency,
    SECONDS_IN_DAY * 2,
    SECONDS_IN_DAY * 2 * 365
  );

  if (!isAccountReady) {
    return null;
  }

  return (
    <ScreenContainer>
      <Header
        title="Transaction Dashboard"
        caption="Leveraged yields"
        tokenSymbol="ETH"
        rightComponent={<PortfolioNetworkSelector />}
        middleComponent={
          <MiddleSection>
            <H3>
              <CountUp value={8.75} decimals={2} duration={1} suffix="%" />{' '}
            </H3>
            {isMobileView ? <H5>APY</H5> : <H3>APY</H3>}
          </MiddleSection>
        }
      />
      <ContentContainer>
        <TopSection>
          <InputContainer
            infoTextRow={<Typography>Info Text Row</Typography>}
            button={{
              enabled: true,
              text: 'Search',
              onClick: () => console.log('search'),
            }}
          >
            <Box>Content</Box>
          </InputContainer>
          <InfoBox
            tabs={[
              {
                label: 'Summary',
                content: <Box>Summary</Box>,
              },
              {
                label: 'Order Details',
                content: <Box>Order Details</Box>,
              },
              {
                label: 'Portfolio Impact',
                content: <Box>Portfolio Impact</Box>,
              },
            ]}
          />
        </TopSection>
        <DataSection
          title="Lending Info"
          button={{
            label: 'View Analytics',
            icon: <BarChartIcon sx={{ fontSize: 16 }} />,
            externalLink: 'https://notional.finance',
          }}
          totalBoxes={[
            {
              title: 'Current Utilization',
              value: 1000,
              decimals: 2,
              suffix: '%',
              trend: {
                value: 5,
                direction: 'up',
                duration: '30d',
              },
            },
            {
              title: 'Total Supplied',
              value: 1000,
              decimals: 2,
              suffix: ' ETH',
              trend: {
                value: 5,
                direction: 'up',
                duration: '30d',
              },
            },
            {
              title: 'Total Borrowed',
              value: 1000,
              decimals: 2,
              suffix: ' ETH',
              trend: {
                value: 5,
                direction: 'down',
                duration: '30d',
              },
            },
          ]}
        >
          {barChartData && barConfig && totalsData && (
            <MultiDisplayChart
              chartComponents={[
                {
                  chartHeaderTotalsData: totalsData,
                  headerButtons: [],
                  id: 'apy-area-chart',
                  title: 'APY',
                  hideTopGridLine: false,
                  Component: (
                    <LineChart
                      data={
                        barChartData?.map(
                          ({
                            timestamp,
                            totalNetWorth,
                            totalAssets,
                            totalDebts,
                          }) => ({
                            date: timestamp,
                            totalNetWorth,
                            totalAssets,
                            totalDebts,
                          })
                        ) || []
                      }
                      lineConfig={barConfig || []}
                      areaKey="totalNetWorth"
                      XAxisKey="date"
                      showYAxis={true}
                      tickFormatter={(value) => {
                        return getDateString(value, { hideYear: true });
                      }}
                    />
                  ),
                },
              ]}
            />
          )}
        </DataSection>
        <FAQSection
          items={[
            {
              question: 'How do I track the status of my transaction?',
              caption: 'Transaction ID: 1234567890',
              answer:
                'You can track the status of your transaction by searching for your transaction ID or by checking the recent transactions list in the dashboard.',
            },
            {
              question: 'What do the different transaction statuses mean?',
              answer:
                'Pending: Transaction is being processed. Completed: Transaction has been successfully processed. Failed: Transaction could not be completed due to an error.',
            },
            {
              question: 'How can I filter transactions by date?',
              answer:
                'Use the Date Range filter button in the search section to select a specific time period for your transactions.',
            },
            {
              question: 'How can I filter transactions by date?',
              answer:
                'Use the Date Range filter button in the search section to select a specific time period for your transactions.',
            },
            {
              question: 'How can I filter transactions by date?',
              answer:
                'Use the Date Range filter button in the search section to select a specific time period for your transactions.',
            },
            {
              question: 'How can I filter transactions by date?',
              answer:
                'Use the Date Range filter button in the search section to select a specific time period for your transactions.',
            },
            {
              question: 'How can I filter transactions by date?',
              answer:
                'Use the Date Range filter button in the search section to select a specific time period for your transactions.',
            },
          ]}
        />
      </ContentContainer>
    </ScreenContainer>
  );
};

// Styled Components
const ScreenContainer = styled(Box)(
  ({ theme }) => `
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: ${theme.spacing(2)};
`
);

const ContentContainer = styled(Box)(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(3)};
`
);

const TopSection = styled(Box)(
  ({ theme }) => `
  display: flex;
  gap: ${theme.spacing(3)};
  max-height: 50vh;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`
);

const MiddleSection = styled(Box)(
  ({ theme }) => `
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: ${theme.spacing(1)};
  color: ${theme.palette.typography.main};

  ${theme.breakpoints.down('sm')} {
    flex-direction: column-reverse;
    align-items: flex-end;
    gap: 0;
  }
`
);

export default TransactionScreen;
