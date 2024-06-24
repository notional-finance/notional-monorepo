import { ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';
interface FaqProps {
  questionString: string;
  question: ReactNode;
  answer?: ReactNode;
  componentAnswer?: ReactNode;
}

export const usePointsFaq = () => {
  const faqData: FaqProps[] = [
    {
      questionString: 'How long does the program run?',
      question: (
        <FormattedMessage
          defaultMessage={'How long does the program run?'}
          description={'faq question'}
        />
      ),
      answer: (
        <FormattedMessage
          defaultMessage={`The ARB Points Program runs from 06/24/24 to 09/15/24`}
        />
      ),
    },
    {
      questionString: 'How do I earn points?',
      question: (
        <FormattedMessage
          defaultMessage={'How do I earn points?'}
          description={'faq question'}
        />
      ),
      answer: (
        <FormattedMessage
          defaultMessage={`You earn points by using Notional on Arbitrum. Some products earn more than others. See the qualifying products tab for more info.`}
        />
      ),
    },
    {
      questionString: 'Will smaller users be rewarded or just whales?',
      question: (
        <FormattedMessage
          defaultMessage={'Will smaller users be rewarded or just whales?'}
          description={'faq question'}
        />
      ),
      answer: (
        <FormattedMessage
          defaultMessage={`Points are awarded to users proportional to their size. It doesn’t matter if you’re a whale or a minnow, you’ll earn the same amount of points for every dollar you deposit.`}
        />
      ),
    },
    {
      questionString:
        'Is there a minimum number of points to receive the airdrop?',
      question: (
        <FormattedMessage
          defaultMessage={
            'Is there a minimum number of points to receive the airdrop?'
          }
          description={'faq question'}
        />
      ),
      answer: (
        <FormattedMessage
          defaultMessage={`Yes. Users need a minimum of 500 points to receive the airdrop.`}
        />
      ),
    },
    {
      questionString: 'When do I receive ARB for my points?',
      question: (
        <FormattedMessage
          defaultMessage={'When do I receive ARB for my points?'}
          description={'faq question'}
        />
      ),
      answer: (
        <FormattedMessage
          defaultMessage={`ARB airdrops occur at the end of each 4-week season. The points you earn in one season will result in an allocation in the ARB airdrop for that season.`}
        />
      ),
    },
  ];
  return faqData;
};
