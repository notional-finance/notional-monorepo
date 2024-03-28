import { ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';
import { Box } from '@mui/material';
import { Body } from '@notional-finance/mui';
import { RiskFaq } from '../components';
import { HowItWorksFaq } from '../components';
import {
  getEtherscanAddressLink,
  Network,
  NotionalAddress,
} from '@notional-finance/util';

interface FaqProps {
  question: ReactNode;
  answer?: ReactNode;
  componentAnswer?: ReactNode;
  questionDescription?: ReactNode;
}

export const useVaultFaq = (
  selectedNetwork: Network | undefined,
  tokenSymbol: string | undefined
) => {
  const faqHeaderLinks = [
    {
      href: 'https://docs.notional.finance/notional-v3/product-guides/leveraged-vaults',
      text: (
        <FormattedMessage defaultMessage={'Leveraged Vault Documentation'} />
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
          defaultMessage={'How does it work?'}
          description={'faq question'}
        />
      ),
      componentAnswer: tokenSymbol ? (
        <HowItWorksFaq tokenSymbol={tokenSymbol} />
      ) : (
        <div />
      ),
      questionDescription: (
        <FormattedMessage defaultMessage={'Learn how leveraged vaults work.'} />
      ),
    },
    {
      question: (
        <FormattedMessage
          defaultMessage={'How are the fees calculated?'}
          description={'faq question'}
        />
      ),
      componentAnswer: (
        <Box>
          <Body sx={{ marginBottom: '8px' }}>
            <FormattedMessage
              defaultMessage={`There are two kinds of fees - borrow fees and trading fees.`}
            />
          </Body>
          <Body>
            •{' '}
            <FormattedMessage
              defaultMessage={`You pay trading fees whenever you deposit or withdraw from the vault because the vault swap assets to deposit or withdraw from the liquidity pool.`}
            />
          </Body>
          <Body>
            •{' '}
            <FormattedMessage
              defaultMessage={`You pay borrow fees to Notional on your leverage. Variable rate borrow fees are paid on an ongoing basis, and fixed rate borrowing fees are paid upfront.`}
            />
          </Body>
        </Box>
      ),
    },
    {
      question: (
        <FormattedMessage
          defaultMessage={'What token are the profits paid in?'}
          description={'faq question'}
        />
      ),
      answer: (
        <FormattedMessage
          defaultMessage={`Profits are paid in the same currency you deposit. When you withdraw, you will withdraw all your principal and earnings in the deposit currency.`}
        />
      ),
    },
    {
      question: (
        <FormattedMessage
          defaultMessage={'How often are rewards reinvested?'}
          description={'faq question'}
        />
      ),
      answer: (
        <FormattedMessage
          defaultMessage={`Rewards are reinvested weekly on Mainnet vaults and daily for vaults on L2.`}
        />
      ),
    },
    {
      question: (
        <FormattedMessage
          defaultMessage={'What happens when my borrow matures?'}
          description={'faq question'}
        />
      ),
      answer: (
        <FormattedMessage
          defaultMessage={`When your borrow matures, it will automatically convert into a variable rate and your vault position will stay open. No action needed from you.`}
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

export default useVaultFaq;
