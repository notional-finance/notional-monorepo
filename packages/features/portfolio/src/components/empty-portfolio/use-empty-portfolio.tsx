import { useParams } from 'react-router';
import { PortfolioParams } from '../../portfolio-feature-shell';
import { useSideDrawerManager } from '@notional-finance/side-drawer';
import {
  PORTFOLIO_CATEGORIES,
  SETTINGS_SIDE_DRAWERS,
} from '@notional-finance/shared-config';
import { defineMessages, MessageDescriptor } from 'react-intl';
interface EmptyPortfolioData {
  messages?: { buttonText: MessageDescriptor; promptText: MessageDescriptor };
  link?: string;
  callback?: () => void;
}

export const useEmptyPortfolio = () => {
  const { category } = useParams<PortfolioParams>();
  const { setWalletSideDrawer } = useSideDrawerManager();

  const emptyData = {
    [PORTFOLIO_CATEGORIES.BORROWS]: {
      messages: defineMessages({
        promptText: {
          defaultMessage: 'You have no borrows or borrow history',
          description: 'empty borrow overview prompt text',
        },
      }),
      link: '',
    },
    [PORTFOLIO_CATEGORIES.LENDS]: {
      messages: defineMessages({
        promptText: {
          defaultMessage: 'You currently have no lends or lend history',
          description: 'empty lend overview prompt text',
        },
        buttonText: {
          defaultMessage: 'Create New Lend Order',
          description: 'empty lend overview button text',
        },
      }),
      link: ``,
    },
    [PORTFOLIO_CATEGORIES.LIQUIDITY]: {
      messages: defineMessages({
        promptText: {
          defaultMessage:
            'You currently have no liquidity or liquidity history',
          description: 'empty liquidity overview prompt text',
        },
      }),
    },
    [PORTFOLIO_CATEGORIES.OVERVIEW]: {
      messages: defineMessages({
        promptText: {
          defaultMessage: 'Connect a wallet to see your portfolio',
          description: 'empty overview prompt text',
        },
        buttonText: {
          defaultMessage: 'Connect A Wallet',
          description: 'empty overview button text',
        },
      }),
      callback: () => setWalletSideDrawer(SETTINGS_SIDE_DRAWERS.CONNECT_WALLET),
    },
    [PORTFOLIO_CATEGORIES.TRANSACTION_HISTORY]: {
      messages: defineMessages({
        promptText: {
          defaultMessage: 'No transaction history to show',
          description: 'empty transaction history overview prompt text',
        },
      }),
      link: '',
    },
    [PORTFOLIO_CATEGORIES.LEVERAGED_VAULTS]: {
      messages: defineMessages({
        promptText: {
          defaultMessage: 'No leveraged vault data to display',
          description: 'empty leveraged vault overview prompt text',
        },
        buttonText: {
          defaultMessage: 'Fund a Leveraged Vault',
          description: 'empty leveraged vault overview button text',
        },
      }),
      link: '',
    },
    [PORTFOLIO_CATEGORIES.MONEY_MARKET]: {
      messages: defineMessages({
        promptText: {
          defaultMessage: 'No idle assets to display',
          description: 'empty money market overview prompt text',
        },
      }),
      link: '',
    },
  } as Record<PORTFOLIO_CATEGORIES, EmptyPortfolioData>;

  return category ? emptyData[category] : {};
};
