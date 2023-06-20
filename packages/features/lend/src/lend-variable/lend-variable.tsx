import {
  FeatureLoader,
  SideBarLayout,
  Faq,
  FaqHeader,
} from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import {
  createBaseTradeContext,
  useBaseTradeContext,
} from '@notional-finance/notionable-hooks';
import { LendVariableSidebar } from './components';
import { TradeActionSummary } from '@notional-finance/trade';
import { NOTIONAL_CATEGORIES } from '@notional-finance/shared-config';
import { useLendVaraibleFaq } from './hooks/use-lend-variable-faq';

export const LendVariableContext = createBaseTradeContext('LendVariable');

export const LendVariable = () => {
  const { faqs, faqHeaderLinks } = useLendVaraibleFaq();
  const context = useBaseTradeContext('LendVariable');
  const {
    state: { isReady, confirm, selectedDepositToken },
  } = context;

  return (
    <LendVariableContext.Provider value={context}>
      <FeatureLoader featureLoaded={isReady && !!selectedDepositToken}>
        <SideBarLayout
          showTransactionConfirmation={confirm}
          sideBar={<LendVariableSidebar />}
          mainContent={
            <TradeActionSummary
              selectedToken={selectedDepositToken || null}
              tradedRate={undefined}
              tradeActionTitle={
                <FormattedMessage defaultMessage={'4.431% Variable APY'} />
              }
              tradeAction={NOTIONAL_CATEGORIES.LEND}
            >
              <FaqHeader
                title={
                  <FormattedMessage defaultMessage={'Variable Lend FAQ'} />
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
    </LendVariableContext.Provider>
  );
};

export default LendVariable;
