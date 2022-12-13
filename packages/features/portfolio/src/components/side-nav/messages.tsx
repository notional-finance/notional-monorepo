import { defineMessages } from 'react-intl';
import { PORTFOLIO_CATEGORIES } from '@notional-finance/shared-config';

export const navLabels = defineMessages({
  [PORTFOLIO_CATEGORIES.OVERVIEW]: {
    defaultMessage: 'Overview',
    description: 'navigation link',
  },
  [PORTFOLIO_CATEGORIES.LENDS]: {
    defaultMessage: 'Lends',
    description: 'navigation link',
  },
  [PORTFOLIO_CATEGORIES.BORROWS]: {
    defaultMessage: 'Borrows',
    description: 'navigation link',
  },
  [PORTFOLIO_CATEGORIES.TRANSACTION_HISTORY]: {
    defaultMessage: 'Transaction History',
    description: 'navigation link',
  },
  [PORTFOLIO_CATEGORIES.LEVERAGED_VAULTS]: {
    defaultMessage: 'Leveraged Vaults',
    description: 'navigation link',
  },
  [PORTFOLIO_CATEGORIES.LIQUIDITY]: {
    defaultMessage: 'Liquidity',
    description: 'navigation link',
  },
  [PORTFOLIO_CATEGORIES.STAKED_NOTE]: {
    defaultMessage: 'Staked NOTE',
    description: 'navigation link',
  },
  [PORTFOLIO_CATEGORIES.MONEY_MARKET]: {
    defaultMessage: 'Idle Assets',
    description: 'navigation link',
  },
});
