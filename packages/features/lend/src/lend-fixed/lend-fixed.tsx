import {
  Faq,
  FaqHeader,
  FeatureLoader,
  SideBarLayout,
  InteractiveAreaChart,
} from '@notional-finance/mui';
import { Box } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import {
  createTradeContext,
  useTradeContext,
} from '@notional-finance/notionable-hooks';
import { LendFixedSidebar, HowItWorksFaq } from './components';
import { TradeActionSummary } from '@notional-finance/trade';
import { useLendFixedChart, useLendFixedFaq } from './hooks';
import { NOTIONAL_CATEGORIES } from '@notional-finance/shared-config';

export const LendFixedContext = createTradeContext('LendFixed');

export const LendFixed = () => {
  const context = useTradeContext('LendFixed');
  const { faqHeaderLinks, faqs } = useLendFixedFaq();
  const {
    state: { isReady, confirm, selectedDepositToken },
  } = context;
  // TODO: Hook up markets and selectedMarketKey data
  const markets: any[] = [];
  const selectedMarketKey = null;
  const { marketData, areaHeaderData, chartToolTipData } =
    useLendFixedChart(markets);

  return (
    <LendFixedContext.Provider value={context}>
      <FeatureLoader featureLoaded={isReady}>
        <SideBarLayout
          showTransactionConfirmation={confirm}
          sideBar={<LendFixedSidebar />}
          mainContent={
            <TradeActionSummary
              selectedToken={selectedDepositToken || null}
              tradeActionTitle={
                <FormattedMessage defaultMessage={'Fixed APY'} />
              }
              tradedRate={undefined}
              tradeAction={NOTIONAL_CATEGORIES.LEND}
            >
              <InteractiveAreaChart
                interactiveAreaChartData={marketData}
                legendData={areaHeaderData}
                onSelectMarketKey={() => {
                  // updateLendState({ selectedMarketKey });
                }}
                selectedMarketKey={selectedMarketKey || ''}
                lockSelection={!!confirm}
                chartToolTipData={chartToolTipData}
              />
              <Box sx={{ marginTop: '48px' }}></Box>
              {selectedDepositToken && (
                <Faq
                  question={
                    <FormattedMessage defaultMessage={'How it Works'} />
                  }
                  componentAnswer={
                    <HowItWorksFaq tokenSymbol={selectedDepositToken} />
                  }
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
              {/* {selectedDepositToken && (
                <CalculatedRatesTable
                  selectedMarketKey={selectedMarketKey}
                  selectedToken={selectedDepositToken}
                  tradeAction={NOTIONAL_CATEGORIES.LEND}
                />
              )} */}
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
                />
              ))}
            </TradeActionSummary>
          }
        />
      </FeatureLoader>
    </LendFixedContext.Provider>
  );
};

export default LendFixed;
