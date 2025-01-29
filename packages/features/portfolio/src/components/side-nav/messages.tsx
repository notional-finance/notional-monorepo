import { defineMessages } from 'react-intl';
import {
  PORTFOLIO_CATEGORIES,
  PORTFOLIO_CONNECTED_WALLET,
} from '@notional-finance/util';

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
  [PORTFOLIO_CATEGORIES.WELCOME]: {
    defaultMessage: 'Welcome',
    description: 'navigation link',
  },
  [PORTFOLIO_CONNECTED_WALLET.PORTFOLIO]: {
    defaultMessage: 'Portfolio',
    description: 'navigation link',
  },
  [PORTFOLIO_CONNECTED_WALLET.RATES]: {
    defaultMessage: 'Rates',
    description: 'navigation link',
  },
  [PORTFOLIO_CONNECTED_WALLET.RISK]: {
    defaultMessage: 'Risk',
    description: 'navigation link',
  },
  [PORTFOLIO_CONNECTED_WALLET.HISTORY]: {
    defaultMessage: 'History',
    description: 'navigation link',
  },
});
