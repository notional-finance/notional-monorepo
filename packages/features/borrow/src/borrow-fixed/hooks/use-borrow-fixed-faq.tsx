import { useContext, ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';
import { Box, useTheme } from '@mui/material';
import { Body } from '@notional-finance/mui';
import { ExitEarlyFaq } from '../components';
import { BorrowFixedContext } from '../borrow-fixed';
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

export const useBorrowFixedFaq = () => {
  const theme = useTheme();
  const selectedNetwork = useSelectedNetwork();
  const {
    state: { selectedDepositToken },
  } = useContext(BorrowFixedContext);
  const faqHeaderLinks = [
    {
      href: 'https://docs.notional.finance/notional-v2/product-guides/fixed-rate-borrowing',
      text: <FormattedMessage defaultMessage={'Fixed Borrow Documentation'} />,
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
          defaultMessage={'What happens at maturity?'}
          description={'faq question'}
        />
      ),
      answer: (
        <FormattedMessage
          defaultMessage={`At maturity your fixed rate debt will automatically switch over to accruing interest at Notional’s variable borrow rate with no penalty. You can leave it at the variable rate, convert it to a fixed rate, or repay it at any time you like.`}
          description={'faq answer'}
        />
      ),
    },

    {
      question: (
        <FormattedMessage
          defaultMessage={'Can I exit early?'}
          description={'faq question'}
        />
      ),
      answer: <ExitEarlyFaq selectedDepositToken={selectedDepositToken} />,
    },
    {
      question: (
        <FormattedMessage
          defaultMessage={'What is the Max LTV?'}
          description={'faq question'}
        />
      ),

      componentAnswer: (
        <Box>
          <Body sx={{ marginBottom: theme.spacing(2) }}>
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
        </Box>
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
        <Box>
          <Body sx={{ marginBottom: theme.spacing(2) }}>
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
        </Box>
      ),
    },
  ];

  return { faqs, faqHeaderLinks };
};

export default useBorrowFixedFaq;
