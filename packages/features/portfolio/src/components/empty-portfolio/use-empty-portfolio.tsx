import { useParams } from 'react-router';
import { PortfolioParams } from '../../portfolio-feature-shell';
import { useSideDrawerManager } from '@notional-finance/side-drawer';
import {
  PORTFOLIO_CATEGORIES,
  SETTINGS_SIDE_DRAWERS,
} from '@notional-finance/util';
import { defineMessages, MessageDescriptor } from 'react-intl';
interface EmptyPortfolioData {
  messages?: { buttonText: MessageDescriptor; promptText: MessageDescriptor };
  link?: string;
  href?: string;
  callback?: () => void;
}

export const useEmptyPortfolio = () => {
  const { category } = useParams<PortfolioParams>();
  const { setWalletSideDrawer } = useSideDrawerManager();

  const emptyData = {
    [PORTFOLIO_CATEGORIES.HOLDINGS]: {
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
      link: '/vaults',
    },
  } as Record<PORTFOLIO_CATEGORIES, EmptyPortfolioData>;

  return category ? emptyData[category] : {};
};
