import {
  Faq,
  FaqHeader,
  FeatureLoader,
  SideBarLayout,
  InteractiveAreaChart,
} from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import {
  createBaseTradeContext,
  useBaseTradeContext,
} from '@notional-finance/notionable-hooks';
import { LendFixedSidebar, HowItWorksFaq } from './components';
import {
  TradeActionSummary,
  TradeActionView,
  CalculatedRatesTable,
} from '@notional-finance/trade';
import { useLendFixedChart, useLendFixedFaq } from './hooks';
import { NOTIONAL_CATEGORIES } from '@notional-finance/shared-config';

export const LendFixedContext = createBaseTradeContext('LendFixed');

export const LendFixed = () => {
  const context = useBaseTradeContext('LendFixed');
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
      <FeatureLoader featureLoaded={isReady && !!selectedDepositToken}>
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
              {selectedDepositToken && (
                <TradeActionView
                  selectedMarketKey={selectedMarketKey}
                  tradeAction={NOTIONAL_CATEGORIES.LEND}
                  selectedToken={selectedDepositToken}
                  fCashAmount={0}
                  interestAmount={0}
                />
              )}
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
              {selectedDepositToken && (
                <CalculatedRatesTable
                  selectedMarketKey={selectedMarketKey}
                  selectedToken={selectedDepositToken}
                  tradeAction={NOTIONAL_CATEGORIES.LEND}
                />
              )}
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
