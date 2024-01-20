import { ReactNode } from 'react';
import { Box, useTheme } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import {
  getEtherscanAddressLink,
  Network,
  NotionalAddress,
} from '@notional-finance/util';
import { RiskFaq, FCashExample } from '../components';

interface FaqProps {
  questionString: string;
  question: ReactNode;
  answer?: ReactNode;
  componentAnswer?: ReactNode;
}

export const useLendLeveragedFaq = (
  tokenSymbol: string | undefined,
  selectedNetwork: Network | undefined
) => {
  const theme = useTheme();
  const faqHeaderLinks = [
    {
      href: 'https://docs.notional.finance/notional-v3/product-guides/leveraged-lending',
      text: (
        <FormattedMessage defaultMessage={'Leveraged Lending Documentation'} />
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
      questionString: 'What is fCash?',
      question: (
        <FormattedMessage
          defaultMessage={'What is f{tokenSymbol}?'}
          description={'faq question'}
          values={{
            tokenSymbol,
          }}
        />
      ),
      componentAnswer: tokenSymbol ? (
        <FCashExample tokenSymbol={tokenSymbol} />
      ) : null,
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
          defaultMessage={`At maturity, your f{tokenSymbol} will automatically net off against your variable rate position. You will be left with a variable rate lending position equal to your initial capital + any profit or loss.`}
          values={{
            tokenSymbol,
          }}
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
      answer: (
        <>
          <Box sx={{ marginBottom: theme.spacing(2) }}>
            <FormattedMessage
              defaultMessage={`Yes. You can can deleverage and exit in one transaction by trading your f{tokenSymbol} on an active fixed rate liquidity pool and then using the {tokenSymbol} you receive to repay your debt.`}
              description={'faq answer'}
              values={{
                tokenSymbol,
              }}
            />
          </Box>
          <Box sx={{ marginBottom: theme.spacing(2) }}>
            <FormattedMessage
              defaultMessage={`f{tokenSymbol} on the three month or six month maturity will always be liquid, but f{tokenSymbol} on the one year maturity will be illiquid for a period of three months and you would not be able to exit during this time.`}
              description={'faq answer'}
              values={{
                tokenSymbol,
              }}
            />
          </Box>
        </>
      ),
    },
    {
      questionString: 'Is there a cost to exit?',
      question: (
        <FormattedMessage
          defaultMessage={'Is there a cost to exit?'}
          description={'faq question'}
        />
      ),

      answer: (
        <>
          <Box sx={{ marginBottom: theme.spacing(2) }}>
            <FormattedMessage
              defaultMessage={`If you exit after maturity there is no cost. If you exit before maturity, you will pay a transaction fee when you trade your f{tokenSymbol} on the liquidity pool.`}
              description={'faq answer'}
              values={{
                tokenSymbol,
              }}
            />
          </Box>
          <Box sx={{ marginBottom: theme.spacing(2) }}>
            <FormattedMessage
              defaultMessage={`The transaction cost you pay depends on the level of interest rates and the time to maturity. The higher the interest rate or the longer the time to maturity, the larger the fee. The lower the interest rate or the closer to maturity, the smaller the fee.`}
              description={'faq answer'}
            />
          </Box>
        </>
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

      componentAnswer: <RiskFaq tokenSymbol={tokenSymbol} />,
    },
  ];

  return { faqs, faqHeaderLinks };
};

export default useLendLeveragedFaq;
