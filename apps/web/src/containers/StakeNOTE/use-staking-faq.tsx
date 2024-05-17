import { ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';
import {
  getEtherscanAddressLink,
  Network,
  sNOTE,
} from '@notional-finance/util';
import { ExternalLink } from '@notional-finance/mui';

interface FaqProps {
  questionString: string;
  question: ReactNode;
  answer?: ReactNode;
}

export const useStakingFaq = () => {
  const faqHeaderLinks = [
    {
      href: 'https://docs.notional.finance/notional-v3/governance/note-staking',
      text: <FormattedMessage defaultMessage={'Staking NOTE Documentation'} />,
    },
    {
      href: getEtherscanAddressLink(sNOTE, Network.mainnet),
      text: <FormattedMessage defaultMessage={'sNOTE Contract'} />,
    },
  ];
  const faqs: FaqProps[] = [
    {
      questionString: 'What happens when I stake my NOTE?',
      question: (
        <FormattedMessage
          defaultMessage={'What happens when I stake my NOTE?'}
        />
      ),
      answer: (
        <FormattedMessage
          defaultMessage={
            'Your NOTE is converted to 80/20 NOTE/ETH Balancer LP tokens. You can stake with 100% NOTE, proportional shares of NOTE and ETH, or 100% ETH if you want to buy NOTE and stake all at once. {br}Once your NOTE is staked, your sNOTE will be redeemable for these Balancer LP tokens. As sNOTE holders earn rewards, your sNOTE will be redeemable for an ever-increasing number of Balancer LP tokens.'
          }
          values={{
            br: (
              <>
                {' '}
                <br /> <br />{' '}
              </>
            ),
          }}
        />
      ),
    },
    {
      questionString: 'How do NOTE stakers earn money?',
      question: (
        <FormattedMessage defaultMessage={'How do NOTE stakers earn money?'} />
      ),
      answer: (
        <FormattedMessage
          defaultMessage={
            'NOTE stakers earn money by receiving additional 80/20 NOTE/ETH Balancer LP tokens. The protocol funds these rewards using protocol revenues.'
          }
        />
      ),
    },
    {
      questionString: 'What are the risks of staking NOTE?',
      question: (
        <FormattedMessage
          defaultMessage={'What are the risks of staking NOTE?'}
        />
      ),
      answer: (
        <FormattedMessage
          defaultMessage={
            'NOTE stakers are exposed to <a1>impermanent loss</a1> from the Balancer pool. Additionally, in a <a2>collateral shortfall event</a2>, up to 50% of sNOTE assets can be used to recapitalize the Notional system.'
          }
          values={{
            a1: (msg: React.ReactNode) => (
              <ExternalLink
                href="https://docs.notional.finance/notional-v3/governance/note-staking#calculating-snote-returns"
                accent
              >
                {msg}
              </ExternalLink>
            ),
            a2: (msg: React.ReactNode) => (
              <ExternalLink
                href="https://docs.notional.finance/notional-v3/governance/note-staking#collateral-shortfall-events"
                accent
              >
                {msg}
              </ExternalLink>
            ),
          }}
        />
      ),
    },
    {
      questionString: 'How do I unstake my NOTE?',
      question: (
        <FormattedMessage defaultMessage={'How do I unstake my NOTE?'} />
      ),
      answer: (
        <FormattedMessage
          defaultMessage={
            'Unstaking NOTE is subject to a mandatory 15 day cooldown. To unstake, you will initiate that cooldown period, and then submit another transaction to unstake during the three day redemption window (Day 16-18) following the cooldown period (Day 1-15). If you don’t unstake in the redemption window, you will need to re-initiate the 15 day cooldown period.'
          }
        />
      ),
    },
  ];

  return { faqs, faqHeaderLinks };
};
