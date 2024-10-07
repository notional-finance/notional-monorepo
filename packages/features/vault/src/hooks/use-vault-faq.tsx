import { ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';
import { Box } from '@mui/material';
import { Body } from '@notional-finance/mui';
import { RiskFaq } from '../components';
import { HowItWorksFaq, HowItWorksFaqPendle } from '../components';
import {
  getEtherscanAddressLink,
  Network,
  NotionalAddress,
  REINVESTMENT_TYPE,
} from '@notional-finance/util';

interface FaqProps {
  question: ReactNode;
  answer?: ReactNode;
  componentAnswer?: ReactNode;
  questionDescription?: ReactNode;
}

export const useVaultFaq = (
  selectedNetwork: Network | undefined,
  tokenSymbol: string | undefined,
  points: Record<string, number> | undefined,
  currentVaultType: REINVESTMENT_TYPE | undefined
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

  const pendleFaq: FaqProps[] = [
    {
      question: (
        <FormattedMessage
          defaultMessage={'How does it work?'}
          description={'faq question'}
        />
      ),
      componentAnswer: tokenSymbol ? (
        <HowItWorksFaqPendle tokenSymbol={tokenSymbol} />
      ) : (
        <div />
      ),
      questionDescription: (
        <FormattedMessage defaultMessage={'Learn how Pendle vaults work.'} />
      ),
    },
    {
      question: (
        <FormattedMessage
          defaultMessage={'Can I exit before the PTs mature?'}
          description={'faq question'}
        />
      ),
      answer: (
        <FormattedMessage
          defaultMessage={`Yes, subject to liquidity. If you exit before maturity, the vault will sell your PTs on the market, repay your debt on Notional, and transfer the remaining funds to your wallet.`}
        />
      ),
    },
    {
      question: (
        <FormattedMessage
          defaultMessage={'What happens when the PTs mature?'}
          description={'faq question'}
        />
      ),
      answer: (
        <FormattedMessage
          defaultMessage={`At maturity your PTs stop earning the fixed PT yield and you should exit the vault to take your principal and profits.`}
        />
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
              defaultMessage={`You pay trading fees whenever you deposit or withdraw from the vault because the vault buys and sells PTs.`}
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
      componentAnswer: <RiskFaq currentVaultType={currentVaultType} />,
    },
  ];

  const baseFaq: FaqProps[] = [
    {
      question: (
        <FormattedMessage
          defaultMessage={'How does it work?'}
          description={'faq question'}
        />
      ),
      componentAnswer: tokenSymbol ? (
        <HowItWorksFaq
          tokenSymbol={tokenSymbol}
          currentVaultType={currentVaultType}
        />
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
      componentAnswer: <RiskFaq currentVaultType={currentVaultType} />,
    },
  ];

  if (currentVaultType === REINVESTMENT_TYPE.AUTO_REINVEST) {
    baseFaq.push(
      {
        question: (
          <FormattedMessage
            defaultMessage={'What token are the profits paid in?'}
            description={'faq question'}
          />
        ),
        answer: points ? (
          <FormattedMessage
            defaultMessage={`Profits from incentive token reinvestments are paid in the same token you deposit and are claimable on Notional. Profits that come from points are distributed directly to you by the partner protocol per the terms of their points program. Points profits are not claimable on Notional.`}
          />
        ) : (
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
        answer: points ? (
          <FormattedMessage
            defaultMessage={`Rewards are reinvested weekly on Mainnet and daily on L2s. Any profits from points are not reinvested - points are only claimable by you directly from partner protocols.`}
          />
        ) : (
          <FormattedMessage
            defaultMessage={`Rewards are reinvested weekly on Mainnet vaults and daily for vaults on L2.`}
          />
        ),
      }
    );
  } else if (currentVaultType === REINVESTMENT_TYPE.DIRECT_CLAIM) {
    baseFaq.push(
      {
        question: (
          <FormattedMessage
            defaultMessage={'Are rewards reinvested back into the strategy?'}
            description={'faq question'}
          />
        ),
        answer: (
          <FormattedMessage
            defaultMessage={`No. Token rewards in this strategy are streamed to you directly. You can claim your rewards at any time and they will be transferred to your wallet.`}
          />
        ),
      },
      {
        question: (
          <FormattedMessage
            defaultMessage={'How do I get my rewards?'}
            description={'faq question'}
          />
        ),
        answer: (
          <FormattedMessage
            defaultMessage={`Providing liquidity earns token incentives. These incentives are streamed to you continuously. You can claim them at any time from your portfolio screen.`}
          />
        ),
      }
    );
  }

  const faqs =
    currentVaultType === REINVESTMENT_TYPE.PENDLE_PT ? pendleFaq : baseFaq;

  return { faqs, faqHeaderLinks };
};

export default useVaultFaq;
