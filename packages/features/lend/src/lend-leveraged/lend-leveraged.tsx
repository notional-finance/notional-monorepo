// import {
//   FeatureLoader,
//   SideBarLayout,
//   Faq,
//   FaqHeader,
// } from '@notional-finance/mui';
// import { FormattedMessage } from 'react-intl';
// import {
//   createTradeContext,
//   useTradeContext,
// } from '@notional-finance/notionable-hooks';
// import { LendLeveragedSidebar } from './components';
// import { TradeActionSummary } from '@notional-finance/trade';
// import { NOTIONAL_CATEGORIES } from '@notional-finance/shared-config';
// import { useLendLeveragedFaq } from './hooks/use-lend-variable-faq';

// export const LendLeveragedContext = createTradeContext('LendLeveraged');

export const LendLeveraged = () => {
  // const context = useTradeContext('LendLeveraged');
  // const {
  //   state: { isReady, confirm, selectedDepositToken },
  // } = context;

  // const { faqs, faqHeaderLinks } = useLendLeveragedFaq(selectedDepositToken);

  return (
    <div>Lend Leveraged</div>
    // <LendLeveragedContext.Provider value={context}>
    //   <FeatureLoader featureLoaded={isReady && !!selectedDepositToken}>
    //     <SideBarLayout
    //       showTransactionConfirmation={confirm}
    //       sideBar={<LendLeveragedSidebar />}
    //       mainContent={
    //         <TradeActionSummary
    //           selectedToken={selectedDepositToken || null}
    //           tradedRate={undefined}
    //           tradeActionTitle={
    //             <FormattedMessage defaultMessage={'4.431% Variable APY'} />
    //           }
    //           tradeAction={NOTIONAL_CATEGORIES.LEND}
    //         >
    //           <FaqHeader
    //             title={
    //               <FormattedMessage defaultMessage={'Variable Lend FAQ'} />
    //             }
    //             links={faqHeaderLinks}
    //           />
    //           {faqs.map(({ question, answer, componentAnswer }, index) => (
    //             <Faq
    //               key={index}
    //               question={question}
    //               answer={answer}
    //               componentAnswer={componentAnswer}
    //             />
    //           ))}
    //         </TradeActionSummary>
    //       }
    //     />
    //   </FeatureLoader>
    // </LendLeveragedContext.Provider>
  );
};

export default LendLeveraged;
