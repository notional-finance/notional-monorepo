import {
  FeatureLoader,
  SideBarLayout,
  Faq,
  FaqHeader,
} from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import {
  createTradeContext,
  useTradeContext,
} from '@notional-finance/notionable-hooks';
import { LendLeveragedSidebar } from './components';
import { TradeActionSummary } from '@notional-finance/trade';
import { useLendLeveragedFaq } from './hooks/use-lend-leveraged-faq';
import { FCashPriceExposure } from './components/fcash-price-exposure';

export const LendLeveragedContext = createTradeContext('LeveragedLend');

export const LendLeveraged = () => {
  const context = useTradeContext('LeveragedLend');
  const { state } = context
  const { isReady, confirm, selectedDepositToken } = state

  const { faqs, faqHeaderLinks } = useLendLeveragedFaq(selectedDepositToken);

  return (
    <LendLeveragedContext.Provider value={context}>
      <FeatureLoader featureLoaded={isReady}>
        <SideBarLayout
          showTransactionConfirmation={confirm}
          sideBar={<LendLeveragedSidebar />}
          mainContent={
            <TradeActionSummary state={state}>
              <FCashPriceExposure state={state} />
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
