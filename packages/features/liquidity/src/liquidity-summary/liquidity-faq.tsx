import { ExternalLink, Faq } from '@notional-finance/mui';
import { defineMessages, FormattedMessage } from 'react-intl';

export const LiquidityFaq = () => {
  const faqs = [
    defineMessages({
      question: {
        defaultMessage: 'What are nTokens and what can I do with them?',
        description: 'faq question',
      },
      answer: {
        defaultMessage:
          "nTokens are the primary way users provide liquidity on Notional, similar to a liquidity provider on any decentralized exchange. nTokens are ERC20 assets that earn returns across all active maturities in the same currency. nTokens are redeemable at any time for a share of Notional's total liquidity in a given currency across all active maturities. Each asset on Notional will have its own nToken ex. nDAI, nUSDC, nETH.",
        description: 'faq answer',
      },
    }),
    defineMessages({
      question: {
        defaultMessage: 'Where do nToken returns come from?',
        description: 'faq question',
      },
      answer: {
        defaultMessage:
          'nTokens earn returns in many ways: trading fees on every lend and borrow, fCash interest, underlying money market interest as a passive lender on Compound or Aave, and NOTE <a1>incentives</a1> from the community. The first three sources of return are incorporated in the “Variable Rate” APY.',
        values: {
          a1: (msg: any) => (
            <ExternalLink
              accent
              href="https://docs.notional.finance/notional-v2/governance/the-note"
            >
              {msg}
            </ExternalLink>
          ),
        },
        description: 'faq answer',
      },
    }),
    defineMessages({
      question: {
        defaultMessage: 'Are the returns fixed like borrowing and lending?',
        description: 'faq question',
      },
      answer: {
        defaultMessage:
          "Liquidity providers (nToken holders) earn variable returns on their capital. The current rate is shown above, but can change based on protocol usage levels, emission rates & NOTE price, interest rates & the size of the liquidity pool relative to a single liquidity provider's share.",
        description: 'faq answer',
      },
    }),
    defineMessages({
      question: {
        defaultMessage: 'Can my nTokens be used as collateral?',
        description: 'faq question',
      },
      answer: {
        defaultMessage:
          'Yes! nTokens are automatically used as collateral for any borrowing on Notional.',
        description: 'faq answer',
      },
    }),
  ];

  return (
    <>
      {faqs.map((data, index) => (
        <Faq
          key={index}
          question={<FormattedMessage {...data.question} />}
          answer={<FormattedMessage {...data.answer} />}
        ></Faq>
      ))}
    </>
  );
};
