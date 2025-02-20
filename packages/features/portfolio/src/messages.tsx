import {
  PORTFOLIO_CATEGORIES,
  PORTFOLIO_CONNECTED_WALLET,
} from '@notional-finance/util';
import { defineMessage, MessageDescriptor } from 'react-intl';

export const messages: Record<
  PORTFOLIO_CATEGORIES | PORTFOLIO_CONNECTED_WALLET,
  MessageDescriptor
> = {
  [PORTFOLIO_CATEGORIES.OVERVIEW]: defineMessage({
    defaultMessage: 'Overview',
    description: '',
  }),
  [PORTFOLIO_CATEGORIES.NOTE_STAKING]: defineMessage({
    defaultMessage: 'NOTE Staking',
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
  [PORTFOLIO_CONNECTED_WALLET.PORTFOLIO]: defineMessage({
    defaultMessage: 'Portfolio',
    description: '',
  }),
  [PORTFOLIO_CONNECTED_WALLET.RATES]: defineMessage({
    defaultMessage: 'Rates',
    description: '',
  }),
  [PORTFOLIO_CONNECTED_WALLET.RISK]: defineMessage({
    defaultMessage: 'Risk',
    description: '',
  }),
  [PORTFOLIO_CONNECTED_WALLET.HISTORY]: defineMessage({
    defaultMessage: 'History',
    description: '',
  }),
  [PORTFOLIO_CATEGORIES.DETAILS]: defineMessage({
    defaultMessage: 'Details',
    description: '',
  }),
};
