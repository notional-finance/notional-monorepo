import { useContext } from 'react';
import { useTheme } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { Body, ExternalLink } from '@notional-finance/mui';
import { useSelectedNetwork } from '@notional-finance/notionable-hooks';
import { LiquidityContext } from '../../liquidity';
import {
  getEtherscanAddressLink,
  NotionalAddress,
} from '@notional-finance/util';
import { RiskFaq } from '../components';

export const useLeveragedLiquidityFaq = (tokenSymbol: string) => {
  const theme = useTheme();
  const selectedNetwork = useSelectedNetwork();
  const context = useContext(LiquidityContext);
  const {
    state: { collateral },
  } = context;
  const faqHeaderLinks = [
    {
      href: 'https://docs.notional.finance/notional-v3/product-guides/leveraged-liquidity',
      text: (
        <FormattedMessage
          defaultMessage={'Leveraged Liquidity Documentation'}
        />
      ),
    },
    {
      href:
        selectedNetwork && collateral?.address
          ? getEtherscanAddressLink(collateral.address, selectedNetwork)
          : '',
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
      href: selectedNetwork
        ? getEtherscanAddressLink(
            NotionalAddress[selectedNetwork],
            selectedNetwork
          )
        : '',
      text: <FormattedMessage defaultMessage={'Notional Contract'} />,
    },
  ];
  const faqs = [
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
        <>
          <FormattedMessage
            defaultMessage={
              'n{tokenSymbol} is an ERC20 token that automates providing liquidity to all of Notional’s {tokenSymbol} fixed rates liquidity pools at once.'
            }
            values={{
              tokenSymbol,
            }}
          />
          <FormattedMessage
            defaultMessage={
              'Learn more about n{tokenSymbol}, how it works, and how it earns returns on the <a1>provide liquidity page.</a1>'
            }
            values={{
              tokenSymbol,
              a1: (msg: React.ReactNode) => (
                <ExternalLink
                  accent
                  textDecoration
                  href="https://docs.notional.finance/notional-v3/product-guides/providing-liquidity"
                >
                  {msg}
                </ExternalLink>
              ),
            }}
          />
        </>
      ),
    },
    {
      question: (
        <FormattedMessage
          defaultMessage={'What is leveraged liquidity?'}
          description={'faq question'}
        />
      ),
      answer: (
        <FormattedMessage
          defaultMessage={
            'A Leveraged liquidity transaction allows you to provide liquidity, borrow against that liquidity, and then provide more liquidity. Leveraged liquidity allows you to earn the spread between the liquidity yield and the borrow rate that you choose. Learn more about providing liquidity on the <a1>provide liquidity</a1> page.'
          }
          values={{
            a1: (msg: React.ReactNode) => (
              <ExternalLink
                accent
                textDecoration
                href="https://docs.notional.finance/notional-v3/product-guides/providing-liquidity"
              >
                {msg}
              </ExternalLink>
            ),
          }}
        />
      ),
    },
    {
      question: (
        <FormattedMessage
          defaultMessage={'Can I exit anytime?'}
          description={'faq question'}
        />
      ),
      answer: (
        <FormattedMessage
          defaultMessage={
            'Yes, you can redeem your liquidity, repay your leverage, and withdraw your assets at any time.'
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
          defaultMessage={'Is there a cost to exit?'}
          description={'faq question'}
        />
      ),
      componentAnswer: (
        <>
          <Body sx={{ marginBottom: theme.spacing(2) }}>
            <FormattedMessage
              defaultMessage={
                'There is no cost to provide liquidity and mint n{tokenSymbol}, but there is a cost when you redeem your n{tokenSymbol} to {tokenSymbol}.'
              }
              description={'faq answer'}
              values={{
                tokenSymbol,
              }}
            />
          </Body>
          <Body>
            <FormattedMessage
              defaultMessage={
                'The redemption cost depends on n{tokenSymbol}’s utilization. The higher {tokenSymbol} fixed interest rates, the higher n{tokenSymbol}’s utilization and the greater the redemption cost.'
              }
              description={'faq answer'}
              values={{
                tokenSymbol,
              }}
            />
          </Body>
        </>
      ),
    },
    {
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
