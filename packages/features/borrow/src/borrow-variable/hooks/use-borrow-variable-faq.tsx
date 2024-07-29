import { useContext, ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';
import { useTheme } from '@mui/material';
import { Body } from '@notional-finance/mui';
import { BorrowVariableContext } from '../borrow-variable';
import {
  getEtherscanAddressLink,
  NotionalAddress,
} from '@notional-finance/util';

interface FaqProps {
  questionString: string;
  question: ReactNode;
  answer?: ReactNode;
  componentAnswer?: ReactNode;
}

export const useBorrowVariableFaq = () => {
  const theme = useTheme();
  const context = useContext(BorrowVariableContext);
  const {
    state: { debt, selectedNetwork, selectedDepositToken },
  } = context;

  const faqHeaderLinks = [
    {
      href: 'https://docs.notional.finance/notional-v3/product-guides/variable-rate-borrowing',
      text: <FormattedMessage defaultMessage={'Borrow Documentation'} />,
    },
    {
      href:
        selectedNetwork && debt?.address
          ? getEtherscanAddressLink(debt.address, selectedNetwork)
          : '',
      text: (
        <FormattedMessage
          defaultMessage={'Prime {tokenSymbol} Contract'}
          values={{
            tokenSymbol: selectedDepositToken,
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
      questionString: 'What is the Max LTV?',
      question: (
        <FormattedMessage
          defaultMessage={'What is the Max LTV?'}
          description={'faq question'}
        />
      ),
      componentAnswer: (
        <>
          <Body sx={{ marginBottom: theme.spacing(1) }}>
            <FormattedMessage
              defaultMessage={
                'Your Max LTV depends on what asset you want to borrow and what asset you’re using as collateral. You can select your desired collateral asset on the right hand side of this page and it will show you the max LTV for that collateral asset + this debt asset.'
              }
            />
          </Body>
          <Body>
            <FormattedMessage
              defaultMessage={
                'Or you can go to our docs and find an exhaustive list of Max LTVs for every collateral asset and debt asset pair.'
              }
            />
          </Body>
        </>
      ),
    },
    {
      questionString: 'When will I get liquidated?',
      question: (
        <FormattedMessage
          defaultMessage={'When will I get liquidated?'}
          description={'faq question'}
        />
      ),

      componentAnswer: (
        <>
          <Body sx={{ marginBottom: theme.spacing(1) }}>
            <FormattedMessage
              defaultMessage={
                'You can get liquidated if the value of your collateral drops too far relative to the value of your debt.'
              }
            />
          </Body>
          <Body>
            <FormattedMessage
              defaultMessage={
                'The Notional UI shows you a health factor as well as liquidation prices to help you monitor your risk. If your health factor drops below 1 or if the market reaches any of your liquidation prices, you can be liquidated.'
              }
            />
          </Body>
        </>
      ),
    },
  ];

  return { faqs, faqHeaderLinks };
};

export default useBorrowVariableFaq;
