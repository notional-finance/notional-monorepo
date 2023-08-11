import { ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';
import { useTheme } from '@mui/material';
import { Body } from '@notional-finance/mui';
// import { ExitEarlyFaq } from '../components';
// import { BorrowVariableContext } from '../borrow-variable';
import { useSelectedNetwork } from '@notional-finance/notionable-hooks';
import {
  getEtherscanAddressLink,
  NotionalAddress,
} from '@notional-finance/util';

interface FaqProps {
  question: ReactNode;
  answer?: ReactNode;
  componentAnswer?: ReactNode;
}

export const useBorrowVariableFaq = () => {
  const theme = useTheme();
  const selectedNetwork = useSelectedNetwork();

  // TODO: Docs link
  const faqHeaderLinks = [
    {
      href: '',
      text: (
        <FormattedMessage defaultMessage={'Variable Borrow Documentation'} />
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
      question: (
        <FormattedMessage
          defaultMessage={'What is the prime borrow premium?'}
          description={'faq question'}
        />
      ),
      componentAnswer: (
        <>
          <Body sx={{ marginBottom: theme.spacing(1) }}>
            <FormattedMessage
              defaultMessage={
                'The prime borrow premium is the extra yield that variable rate borrowers pay on top of the external lending rate. It is based on the utilization of the variable rate lending market.'
              }
            />
          </Body>
          <Body sx={{ fontWeight: 600 }}>
            <FormattedMessage
              defaultMessage={
                'Borrow rate = external lending rate + prime borrow premium'
              }
            />
          </Body>
        </>
      ),
    },
    {
      question: (
        <FormattedMessage
          defaultMessage={'What is the external lending rate?'}
          description={'faq question'}
        />
      ),

      componentAnswer: (
        <>
          <Body sx={{ marginBottom: theme.spacing(1) }}>
            <FormattedMessage
              defaultMessage={
                'The external lending rate is the rate that Notional is earning on assets in external money markets which aren’t being utilized by borrowers on Notional.'
              }
            />
          </Body>
          <Body sx={{ fontWeight: 600 }}>
            <FormattedMessage
              defaultMessage={
                'Borrow rate = external lending rate + prime borrow premium'
              }
            />
          </Body>
        </>
      ),
    },
    {
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
                'Your Max LTV depends on what asset you want to borrow and what asset you’re using as collateral. You can select your desired collateral asset on the righthand side of this page and it will show you the max LTV for that collateral asset + this debt asset.'
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
