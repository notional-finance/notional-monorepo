import { ExternalLink } from '@notional-finance/mui';
import React from 'react';
import { defineMessages } from 'react-intl';

export const messages = {
  stake: defineMessages({
    heading: { defaultMessage: 'Stake NOTE', description: 'section heading' },
    helptext: {
      defaultMessage:
        'Staked NOTE holders provide liquidity in an 80/20 NOTE/ETH Balancer pool. <a>Learn More</a>',
      description: 'section helptext',
      values: {
        a: (msg: string) => (
          <ExternalLink
            href="https://docs.notional.finance/notional-v2/governance/note-staking"
            accent
          >
            {msg}
          </ExternalLink>
        ),
      },
    },
    inputNOTE: {
      defaultMessage: '1. Enter the amount of NOTE you want to stake',
      description: 'input label',
    },
    setNOTEToZero: {
      defaultMessage: 'NOTE amount cannot be blank, zero is accepted',
      description: 'error message',
    },
    priceImpact: { defaultMessage: 'Too much price impact', description: 'error message' },
    inputETH: { defaultMessage: '2. Adjust the amount of ETH or WETH', description: 'input label' },
    infoBoxHelptext: {
      defaultMessage: 'Staking with 80% NOTE is recommended for best results.',
      description: 'help text',
    },
    tabLabel: { defaultMessage: 'Stake', description: 'tab label' },
  }),
  unstake: defineMessages({
    tabLabel: { defaultMessage: 'Unstake', description: 'tab label' },
    heading: { defaultMessage: 'Unstake and Redeem sNOTE', description: 'heading' },
    helptext: {
      defaultMessage:
        'Unstaking your sNOTE requires a 15 day cooldown period. After you will have a 3 day window to redeem.',
      description: 'helptext',
    },
    noSNOTEBalance: {
      defaultMessage: 'Wallet has no sNOTE balance to unstake',
      description: 'error message',
    },
    connectWalletCTA: {
      defaultMessage: 'Connect your wallet to unstake',
      description: 'button text',
    },
    unstakeHeading: {
      defaultMessage: 'Unstake and Redeem sNOTE',
      description: 'heading',
    },
    coolDownHeading: {
      defaultMessage: 'Cool Down Period Initiated',
      description: 'heading',
    },
    coolDownHelptext: {
      defaultMessage: 'Staking and transfers will be disabled during cooldown period.',
      description: 'helptext',
    },
    coolDownCalendarHeader: {
      defaultMessage: 'Remind Me',
      description: 'section heading',
    },
    coolDownCalendarText: {
      defaultMessage: 'Add to Calendar',
      description: 'call to action',
    },
    startCoolDownConfirm: {
      defaultMessage: 'Start Cool Down Period',
    },
    cancelCoolDownHeading: {
      defaultMessage: 'Cancel Cool Down Period',
    },
    cancelCoolDownCTA: {
      defaultMessage: 'Cancel Cooldown',
      description: 'call to action',
    },
    redeemHelptext: {
      defaultMessage: 'You will only have 3 days to redeem your sNOTE once the cooldown ends.',
      description: 'helptext',
    },
    redeemCTA: {
      defaultMessage: 'Redeem Staked NOTE',
      description: 'button cta',
    },
    redemptionWindow: {
      defaultMessage: 'Redemption Window',
      description: 'section heading',
    },
    endRedemptionCTA: {
      defaultMessage: 'End Redemption Window',
      description: 'button cta',
    },
    redeemInput: {
      defaultMessage: 'Enter amount of sNOTE you want to unstake',
      description: 'input label',
    },
    unstakeCTA: {
      defaultMessage: 'Start 15 Day Cooldown To Unstake',
      description: 'button text',
    },
  }),
  summary: defineMessages({
    subtitle: {
      defaultMessage:
        'Staked NOTE holders earn reinvestments from protocol revenue & trading fees.',
      description: 'subtitle',
    },
    totalStakedNoteValue: { defaultMessage: 'Total sNOTE Value', description: 'section label' },
    annualRewardRate: { defaultMessage: 'Annual Reward Rate', description: 'section label' },
    faqHeading: { defaultMessage: 'Staked NOTE FAQ', description: 'section heading' },
    moreFAQ: { defaultMessage: 'Read the full staking documentation', description: 'section link' },
  }),
  faq: [
    defineMessages({
      question: {
        defaultMessage: 'What happens when I stake my NOTE?',
        description: 'faq question',
      },
      answer: {
        defaultMessage:
          'Your NOTE is converted to 80/20 NOTE/ETH Balancer LP tokens. You can stake with 100% NOTE, proportional shares of NOTE and ETH, or 100% ETH if you want to buy NOTE and stake all at once. {br}Once your NOTE is staked, your sNOTE will be redeemable for these Balancer LP tokens. As sNOTE holders earn rewards, your sNOTE will be redeemable for an ever-increasing number of Balancer LP tokens.',
        description: 'faq answer',
        values: {
          br: (
            <>
              <br />
              <br />
            </>
          ),
        },
      },
    }),
    defineMessages({
      question: {
        defaultMessage: 'How do NOTE stakers earn money?',
        description: 'faq question',
      },
      answer: {
        defaultMessage:
          'NOTE stakers earn money by receiving additional 80/20 NOTE/ETH Balancer LP tokens. The protocol funds these rewards using protocol revenues.',
        description: 'faq answer',
      },
    }),
    defineMessages({
      question: {
        defaultMessage: 'What are the risks of staking NOTE?',
        description: 'faq question',
      },
      answer: {
        defaultMessage:
          'NOTE stakers are exposed to <a1>impermanent loss</a1> from the Balancer pool. Additionally, in a <a2>collateral shortfall event</a2>, up to 50% of sNOTE assets can be used to recapitalize the Notional system.',
        description: 'faq answer',
        values: {
          a1: (msg: React.ReactNode) => (
            <ExternalLink
              href="https://docs.notional.finance/notional-v2/governance/note-staking#calculating-snote-returns"
              accent
            >
              {msg}
            </ExternalLink>
          ),
          a2: (msg: React.ReactNode) => (
            <ExternalLink
              href="https://docs.notional.finance/notional-v2/governance/note-staking#collateral-shortfall-events"
              accent
            >
              {msg}
            </ExternalLink>
          ),
        },
      },
    }),
    defineMessages({
      question: {
        defaultMessage: 'How do I unstake my NOTE?',
        description: 'faq question',
      },
      answer: {
        defaultMessage:
          'Unstaking NOTE is subject to a mandatory 15 day cooldown. To unstake, you will initiate that cooldown period, and then submit another transaction to unstake during the three day redemption window (Day 16-18) following the cooldown period (Day 1-15). If you don’t unstake in the redemption window, you will need to re-initiate the 15 day cooldown period.',
        description: 'faq answer',
      },
    }),
  ],
};
