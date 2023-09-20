import { useContext, ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';
import { useTheme } from '@mui/material';
import { Body, ExternalLink } from '@notional-finance/mui';
import { useSelectedNetwork } from '@notional-finance/notionable-hooks';
import { BorrowVariableContext } from '../borrow-variable';
import {
  getEtherscanAddressLink,
  NotionalAddress,
} from '@notional-finance/util';

interface FaqProps {
  question: ReactNode;
  answer?: ReactNode;
  componentAnswer?: ReactNode;
}

export const useBorrowVariableFaq = (tokenSymbol?: string) => {
  const theme = useTheme();
  const context = useContext(BorrowVariableContext);
  const {
    state: { debt },
  } = context;
  const selectedNetwork = useSelectedNetwork();

  const faqHeaderLinks = [
    {
      href: 'https://docs.notional.finance/notional-v3/product-guides/variable-rate-borrowing',
      text: (
        <FormattedMessage defaultMessage={'Variable Borrow Documentation'} />
      ),
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
        <Body sx={{ marginBottom: theme.spacing(1) }}>
          <FormattedMessage
            defaultMessage={`Your Max LTV depends on what asset you’re borrowing and what you’re using as collateral. For a full table of Max LTVs by asset and collateral type, go to our <a1>docs.</a1>`}
            values={{
              a1: (msg: ReactNode) => (
                <ExternalLink
                  accent
                  href="https://docs.notional.finance/notional-v3/borrower-resources/max-ltv-table"
                >
                  {msg}
                </ExternalLink>
              ),
            }}
          />
        </Body>
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
