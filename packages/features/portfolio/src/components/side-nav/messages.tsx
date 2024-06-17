import { defineMessages } from 'react-intl';
import { PORTFOLIO_CATEGORIES } from '@notional-finance/util';

export const navLabels = defineMessages({
  [PORTFOLIO_CATEGORIES.OVERVIEW]: {
    defaultMessage: 'Overview',
    description: 'navigation link',
  },
  [PORTFOLIO_CATEGORIES.HOLDINGS]: {
    defaultMessage: 'Holdings',
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
  [PORTFOLIO_CATEGORIES.NOTE_STAKING]: {
    defaultMessage: 'Note staking',
    description: 'navigation link',
  },
});
