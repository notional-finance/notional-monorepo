import { ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';
import { RiskFaq } from '../components';

interface FaqProps {
  question: ReactNode;
  answer?: ReactNode;
  componentAnswer?: ReactNode;
}

export const useLendVaraibleFaq = () => {
  // TODO: ADD LINKS
  const faqHeaderLinks = [
    {
      href: '',
      text: (
        <FormattedMessage defaultMessage={'Variable Lending Documentation'} />
      ),
    },
    {
      href: '',
      text: <FormattedMessage defaultMessage={'Prime USDC Contract'} />,
    },
    {
      href: '',
      text: <FormattedMessage defaultMessage={'Notional Contract'} />,
    },
  ];
  const faqs: FaqProps[] = [
    {
      question: (
        <FormattedMessage
          defaultMessage={'What are Prime USDC and Prime USDC Debt?'}
          description={'faq question'}
        />
      ),
      answer: (
        <FormattedMessage
          defaultMessage={`Prime USDC is USDC that is being lent on Notional’s variable rate USDC lending market. Prime USDC debt is USDC that is being borrowed form the variable rate USDC lending market.`}
          description={'faq answer'}
        />
      ),
    },

    {
      question: (
        <FormattedMessage
          defaultMessage={'Where does the yield come from?'}
          description={'faq question'}
        />
      ),
      answer: (
        <FormattedMessage
          defaultMessage={`Lenders earn yield by lending their funds to over-collateralized borrowers. Any funds that aren’t being utilized by borrowers on Notional can be deposited on external money markets to generate additional yield.`}
        />
      ),
    },
    {
      question: (
        <FormattedMessage
          defaultMessage={'Why is the Prime USDC debt APY so high?'}
          description={'faq question'}
        />
      ),
      answer: (
        <FormattedMessage
          defaultMessage={`Variable rate borrowers on Notional are willing to pay high rates to use Notional’s leveraged vaults. Leveraged vaults allow advanced DeFi users to get Leverage for whitelisted, over-collateralized DeFi yield strategies. This pushes the borrowing rate up and drives high returns for lenders.`}
          description={'faq answer'}
        />
      ),
    },
    {
      question: (
        <FormattedMessage
          defaultMessage={'What are the risks?'}
          description={'faq question'}
        />
      ),

      componentAnswer: <RiskFaq />,
    },
  ];

  return { faqs, faqHeaderLinks };
};

export default useLendVaraibleFaq;
