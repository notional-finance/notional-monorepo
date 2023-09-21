import { useTheme } from '@mui/material';
import {
  SideBarLayout,
  Faq,
  FaqHeader,
  DataTable,
} from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import {
  createTradeContext,
  useTradeContext,
} from '@notional-finance/notionable-hooks';
import { LendLeveragedSidebar, HowItWorksFaq } from './components';
import {
  LiquidationChart,
  PerformanceChart,
  TradeActionSummary,
} from '@notional-finance/trade';
import {
  useLendLeveragedFaq,
  useRatesTable,
  useFCashPriceExposureTable,
} from './hooks';
import { FeatureLoader } from '@notional-finance/shared-web';

export const LendLeveragedContext = createTradeContext('LeveragedLend');

export const LendLeveraged = () => {
  const theme = useTheme();
  const context = useTradeContext('LeveragedLend');
  const { state } = context;
  const { isReady, confirm, selectedDepositToken, deposit } = state;
  const { fCashPriceExposureColumns, fCashPriceExposureData } =
    useFCashPriceExposureTable(state);
  const { faqs, faqHeaderLinks } = useLendLeveragedFaq(selectedDepositToken);
  const { ratesColumns, ratesData } = useRatesTable(selectedDepositToken);

  return (
    <LendLeveragedContext.Provider value={context}>
      <FeatureLoader featureLoaded={isReady}>
        <SideBarLayout
          showTransactionConfirmation={confirm}
          sideBar={<LendLeveragedSidebar />}
          mainContent={
            <TradeActionSummary state={state}>
              <PerformanceChart state={state} />
              {selectedDepositToken && (
                <Faq
                  sx={{ boxShadow: 'none' }}
                  question={
                    <FormattedMessage defaultMessage={'How it Works'} />
                  }
                  componentAnswer={
                    <HowItWorksFaq tokenSymbol={selectedDepositToken} />
                  }
                  questionDescription={
                    <FormattedMessage
                      defaultMessage={'Learn how leveraged lending works.'}
                    />
                  }
                />
              )}
              <LiquidationChart state={state} />
              <DataTable
                maxHeight={theme.spacing(40)}
                tableTitle={
                  <FormattedMessage
                    defaultMessage={'f{symbol}/{symbol} Price Exposure'}
                    values={{ symbol: deposit?.symbol || '' }}
                  />
                }
                stateZeroMessage={
                  <FormattedMessage
                    defaultMessage={'Fill in inputs to see price exposure'}
                  />
                }
                data={fCashPriceExposureData}
                columns={fCashPriceExposureColumns}
              />
              <DataTable
                tableTitle={
                  <FormattedMessage
                    defaultMessage={
                      '{selectedDepositToken} Lend & Borrow Rates'
                    }
                    values={{ selectedDepositToken }}
                  />
                }
                data={ratesData}
                columns={ratesColumns}
                sx={{ marginTop: theme.spacing(3) }}
              />
              <FaqHeader
                title={
                  <FormattedMessage defaultMessage={'Leveraged Lend FAQ'} />
                }
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
    </LendLeveragedContext.Provider>
  );
};

export default LendLeveraged;
