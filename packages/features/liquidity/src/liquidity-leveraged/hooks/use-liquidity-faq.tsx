import { FormattedMessage } from 'react-intl';
import { Body } from '@notional-finance/mui';
import { RiskFaq } from '../components';

export const useLiquidityFaq = (tokenSymbol: string) => {
  // TODO: ADD LINKS
  const faqHeaderLinks = [
    {
      href: '',
      text: <FormattedMessage defaultMessage={'nToken Documentation'} />,
    },
    {
      href: '',
      text: (
        <FormattedMessage
          defaultMessage={'n{tokenSymbol} Contract'}
          values={{
            tokenSymbol,
          }}
        />
      ),
    },
    {
      href: '',
      text: <FormattedMessage defaultMessage={'Notional Contract'} />,
    },
  ];
  const faqs = [
    {
      question: (
        <FormattedMessage
          defaultMessage={'What are the risks?'}
          description={'faq question'}
        />
      ),
      componentAnswer: <RiskFaq tokenSymbol={tokenSymbol} />,
    },

    {
      question: (
        <FormattedMessage
          defaultMessage={'What is n{tokenSymbol}?'}
          description={'faq question'}
          values={{
            tokenSymbol,
          }}
        />
      ),
      answer: (
        <FormattedMessage
          defaultMessage={
            'n{tokenSymbol} is a simple and easy way to earn returns from providing liquidity to all fixed rate {tokenSymbol} liquidity pools at once. n{tokenSymbol} is an ERC20 token that automates providing liquidity to give you a fully passive experience. Set, forget, and earn rewards!'
          }
          values={{
            tokenSymbol,
          }}
        />
      ),
    },
    {
      question: (
        <FormattedMessage
          defaultMessage={'Where do n{tokenSymbol} returns come from?'}
          description={'faq question'}
          values={{
            tokenSymbol,
          }}
        />
      ),
      componentAnswer: (
        <div>
          <Body>
            <FormattedMessage
              defaultMessage={'n{tokenSymbol} earns returns in three ways:'}
              values={{
                tokenSymbol,
              }}
            />
          </Body>
          <Body>
            •{' '}
            <FormattedMessage
              defaultMessage={
                'Interest accrual on Prime {tokenSymbol} and f{tokenSymbol}'
              }
              values={{
                tokenSymbol,
              }}
            />
          </Body>
          <Body>
            •{' '}
            <FormattedMessage
              defaultMessage={
                'f{tokenSymbol} Transaction fees any time a user borrows or lends at a fixed rate'
              }
              values={{
                tokenSymbol,
              }}
            />
          </Body>
          <Body>
            • <FormattedMessage defaultMessage={'NOTE incentives'} />
          </Body>
        </div>
      ),
    },
    {
      question: (
        <FormattedMessage
          defaultMessage={'Is n{tokenSymbol} Redeemable?'}
          description={'faq question'}
          values={{
            tokenSymbol,
          }}
        />
      ),

      componentAnswer: (
        <div>
          <Body>
            <FormattedMessage
              defaultMessage={
                'n{tokenSymbol} can always be redeemable for {tokenSymbol} except when utilization on Notional’s lending markets is very high.'
              }
              description={'faq answer'}
              values={{
                tokenSymbol,
              }}
            />
          </Body>
          <br />
          <Body>
            <FormattedMessage
              defaultMessage={
                'When utilization is too high, n{tokenSymbol} can be redeemed for a proportional share of the Prime {tokenSymbol} and f{tokenSymbol} held in the n{tokenSymbol} account.'
              }
              description={'faq answer'}
              values={{
                tokenSymbol,
              }}
            />
          </Body>
        </div>
      ),
    },
    {
      question: (
        <FormattedMessage
          defaultMessage={'What is Leverage Mode?'}
          description={'faq question'}
        />
      ),

      componentAnswer: (
        <div>
          <Body>
            <FormattedMessage
              defaultMessage={
                'Leverage mode makes it easy to borrow against your n{tokenSymbol} at a fixed or variable rate in order to provide more n{tokenSymbol} in a single transaction.'
              }
              description={'faq answer'}
              values={{
                tokenSymbol,
              }}
            />
          </Body>
          <br />
          <Body>
            <FormattedMessage
              defaultMessage={
                'Using leverage can increase your yield if the n{tokenSymbol} APY is greater than the borrow rate.'
              }
              description={'faq answer'}
              values={{
                tokenSymbol,
              }}
            />
          </Body>
          <br />
          <Body>
            <FormattedMessage
              defaultMessage={
                'But leverage also includes liquidation risk. The n{tokenSymbol} price is stable, but it can temporarily decrease due to IL. So if you decide to use leverage, be careful.'
              }
              description={'faq answer'}
              values={{
                tokenSymbol,
              }}
            />
          </Body>
        </div>
      ),
    },
  ];

  return { faqs, faqHeaderLinks };
};
