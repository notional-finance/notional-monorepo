import { useParams } from 'react-router';
import { PortfolioParams } from '../../portfolio-feature-shell';
import { PORTFOLIO_CATEGORIES } from '@notional-finance/util';
import { defineMessages, MessageDescriptor } from 'react-intl';
import { useSelectedNetwork } from '@notional-finance/notionable-hooks';
interface EmptyPortfolioData {
  messages?: { buttonText: MessageDescriptor; promptText: MessageDescriptor };
  link?: string;
  href?: string;
  callback?: () => void;
}

export const useEmptyPortfolio = () => {
  const { category } = useParams<PortfolioParams>();
  const selectedNetwork = useSelectedNetwork();

  const emptyData = {
    [PORTFOLIO_CATEGORIES.OVERVIEW]: {
      messages: defineMessages({
        promptText: {
          defaultMessage: 'No overview data to display',
          description: 'empty overview prompt text',
        },
        buttonText: {
          defaultMessage: 'Learn about products',
          description: 'empty overview button text',
        },
      }),
      link: `/portfolio/${selectedNetwork}/welcome/earn`,
    },
    [PORTFOLIO_CATEGORIES.TRANSACTION_HISTORY]: {
      messages: defineMessages({
        promptText: {
          defaultMessage: 'No transaction history to show',
          description: 'empty transaction history overview prompt text',
        },
        buttonText: {
          defaultMessage: 'Learn about products',
          description: 'empty overview button text',
        },
      }),
      link: `/portfolio/${selectedNetwork}/welcome/earn`,
    },
    [PORTFOLIO_CATEGORIES.NOTE_STAKING]: {
      messages: defineMessages({
        promptText: {
          defaultMessage: 'No Data Available',
          description: 'empty note staking overview prompt text',
        },
        buttonText: {
          defaultMessage: 'Trade NOTE',
          description: 'empty note staking button text',
        },
      }),
      link: '',
      href: 'https://matcha.xyz/tokens/ethereum/0xcfeaead4947f0705a14ec42ac3d44129e1ef3ed5',
    },
    [PORTFOLIO_CATEGORIES.DETAILS]: {
      messages: defineMessages({
        promptText: {
          defaultMessage: 'No details data to display',
          description: 'empty details prompt text',
        },
      }),
      link: '',
    },
    [PORTFOLIO_CATEGORIES.RISK]: {
      messages: defineMessages({
        promptText: {
          defaultMessage: 'No risk data to display',
          description: 'empty risk prompt text',
        },
      }),
      link: '',
    },
  } as Record<PORTFOLIO_CATEGORIES, EmptyPortfolioData>;

  return category ? emptyData[category] : {};
};
