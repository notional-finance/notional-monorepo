import { PORTFOLIO_CATEGORIES } from '@notional-finance/util';
import { defineMessage, MessageDescriptor } from 'react-intl';

export const messages: Record<PORTFOLIO_CATEGORIES, MessageDescriptor> = {
  [PORTFOLIO_CATEGORIES.OVERVIEW]: defineMessage({
    defaultMessage: 'Overview',
    description: '',
  }),
  [PORTFOLIO_CATEGORIES.HOLDINGS]: defineMessage({
    defaultMessage: 'Portfolio Holdings',
    description: '',
  }),
  [PORTFOLIO_CATEGORIES.NOTE_STAKING]: defineMessage({
    defaultMessage: 'NOTE Staking',
    description: '',
  }),
  [PORTFOLIO_CATEGORIES.LEVERAGED_VAULTS]: defineMessage({
    defaultMessage: 'Leveraged Vaults',
    description: '',
  }),
  [PORTFOLIO_CATEGORIES.TRANSACTION_HISTORY]: defineMessage({
    defaultMessage: 'Transaction History',
    description: '',
  }),
  [PORTFOLIO_CATEGORIES.WELCOME]: defineMessage({
    defaultMessage: 'Welcome',
    description: '',
  }),
};
