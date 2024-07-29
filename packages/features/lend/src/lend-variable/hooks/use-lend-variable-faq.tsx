import { useContext, ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';
import { LendVariableContext } from '../../lend-variable/lend-variable';
import {
  getEtherscanAddressLink,
  Network,
  NotionalAddress,
} from '@notional-finance/util';
import { RiskFaq } from '../components';

interface FaqProps {
  questionString: string;
  question: ReactNode;
  answer?: ReactNode;
  componentAnswer?: ReactNode;
}

export const useLendVariableFaq = (
  tokenSymbol: string | undefined,
  selectedNetwork: Network | undefined
) => {
  const context = useContext(LendVariableContext);
  const {
    state: { collateral },
  } = context;

  const faqHeaderLinks = [
    {
      href: 'https://docs.notional.finance/notional-v3/product-guides/variable-rate-lending',
      text: <FormattedMessage defaultMessage={'Lending Documentation'} />,
    },
    {
      href:
        selectedNetwork && collateral?.address
          ? getEtherscanAddressLink(collateral.address, selectedNetwork)
          : '',
      text: (
        <FormattedMessage
          defaultMessage={'Prime {tokenSymbol} Contract'}
          values={{
            tokenSymbol,
          }}
        />
      ),
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
      questionString: 'What is Prime tokenSymbol and Prime tokenSymbol Debt?',
      question: (
        <FormattedMessage
          defaultMessage={
            'What is Prime {tokenSymbol} and Prime {tokenSymbol} Debt?'
          }
          description={'faq question'}
          values={{
            tokenSymbol,
          }}
        />
      ),
      answer: (
        <FormattedMessage
          defaultMessage={`Prime {tokenSymbol} is {tokenSymbol} that is being lent on Notional’s variable rate {tokenSymbol} lending market. Prime {tokenSymbol} debt is {tokenSymbol} that is being borrowed form the variable rate {tokenSymbol} lending market.`}
          description={'faq answer'}
          values={{
            tokenSymbol,
          }}
        />
      ),
    },
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
        />
      ),
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

export default useLendVariableFaq;
