import { ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';
import {
  startDateDisplayString,
  endDateDisplayString,
} from '@notional-finance/notionable-hooks';
import { RealizedApyFaq } from '../components';
interface FaqProps {
  questionString: string;
  question: ReactNode;
  answer?: ReactNode;
  componentAnswer?: ReactNode;
}

export const useContestRulesInfo = () => {
  const dataSetOne = [
    {
      text: (
        <FormattedMessage
          defaultMessage={`The yield competition will take place from {startDate} to {endDate}.`}
          values={{
            startDate: startDateDisplayString,
            endDate: endDateDisplayString,
          }}
        />
      ),
    },
    {
      text: (
        <FormattedMessage
          defaultMessage={`Rankings are based on the participant’s realized APY (details below).`}
        />
      ),
    },
    {
      text: (
        <FormattedMessage
          defaultMessage={`Participants can use any product on Notional to earn yield.`}
        />
      ),
    },
    {
      text: (
        <FormattedMessage
          defaultMessage={`Profits or losses due to changing exchange rates will be ignored. This contest rewards earning yield, not speculating on changes in token prices.`}
        />
      ),
    },
    {
      text: (
        <FormattedMessage
          defaultMessage={`Prize winners must submit KYC to claim their prizes.`}
        />
      ),
    },
  ];
  const faqData: FaqProps[] = [
    {
      questionString: 'What is realized APY?',
      question: (
        <FormattedMessage
          defaultMessage={'What is realized APY?'}
          description={'faq question'}
        />
      ),
      answer: <RealizedApyFaq />,
    },
    {
      questionString: 'What are the minimum requirements?',
      question: (
        <FormattedMessage
          defaultMessage={'What are the minimum requirements?'}
          description={'faq question'}
        />
      ),
      answer: (
        <FormattedMessage
          defaultMessage={`Participants must hold a minimum account value of $100 in Notional for at least 24 hours to be eligible for prizes.`}
        />
      ),
    },
    {
      questionString: 'Can I enter the contest late?',
      question: (
        <FormattedMessage
          defaultMessage={'Can I enter the contest late?'}
          description={'faq question'}
        />
      ),
      answer: (
        <FormattedMessage
          defaultMessage={`Yes. Participants can enter and exit at any time during the contest. Participants can have assets in their account before the start of the contest but they do not need to.`}
        />
      ),
    },
    {
      questionString: 'Do token incentives count as yield?',
      question: (
        <FormattedMessage
          defaultMessage={'Do token incentives count as yield?'}
          description={'faq question'}
        />
      ),
      answer: (
        <FormattedMessage
          defaultMessage={`Yes. NOTE and ARB incentives are counted as earnings and will be converted to USD using their average prices over the course of the contest.`}
        />
      ),
    },
  ];
  return { dataSetOne, faqData };
};
