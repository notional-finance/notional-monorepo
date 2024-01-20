import { ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';
import { ExitEarlyFaq, RiskFaq } from '../components';
import {
  getEtherscanAddressLink,
  Network,
  NotionalAddress,
} from '@notional-finance/util';

interface FaqProps {
  questionString: string;
  question: ReactNode;
  answer?: ReactNode;
  componentAnswer?: ReactNode;
}

export const useLendFixedFaq = (selectedNetwork: Network | undefined) => {
  const faqHeaderLinks = [
    {
      href: 'https://docs.notional.finance/notional-v3/product-guides/fixed-rate-lending',
      text: <FormattedMessage defaultMessage={'Fixed Lending Documentation'} />,
    },
    {
      href: selectedNetwork
        ? getEtherscanAddressLink(
            NotionalAddress[selectedNetwork],
            selectedNetwork
          )
        : '',
      text: <FormattedMessage defaultMessage={'Notional Contract'} />,
    },
  ];
  const faqs: FaqProps[] = [
    {
      questionString: 'Where does the yield come from?',
      question: (
        <FormattedMessage
          defaultMessage={'Where does the yield come from?'}
          description={'faq question'}
        />
      ),
      answer: (
        <FormattedMessage
          defaultMessage={`Yield on Notional comes from lending to over-collateralized borrowers and advanced DeFi users who want leverage on DeFi yield strategies.`}
          description={'faq answer'}
        />
      ),
    },

    {
      questionString: 'What happens at maturity?',
      question: (
        <FormattedMessage
          defaultMessage={'What happens at maturity?'}
          description={'faq question'}
        />
      ),
      answer: (
        <FormattedMessage
          defaultMessage={`At maturity your fixed rate loan will automatically switch over to earning interest at Notional’s variable lending rate. No action required from you at all! You can withdraw your capital, leave it earning the variable rate, or extend your loan to a new fixed rate at a new maturity. It’s up to you!`}
        />
      ),
    },
    {
      questionString: 'Can I exit early?',
      question: (
        <FormattedMessage
          defaultMessage={'Can I exit early?'}
          description={'faq question'}
        />
      ),
      answer: <ExitEarlyFaq />,
    },
    {
      questionString: 'What are the risks?',
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

export default useLendFixedFaq;
