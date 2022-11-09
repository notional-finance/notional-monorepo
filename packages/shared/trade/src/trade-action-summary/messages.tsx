import { LEND_BORROW } from '@notional-finance/utils';
import { defineMessages, MessageDescriptor } from 'react-intl';

interface MessageData {
  title?: MessageDescriptor;
}

export const messages = {
  [LEND_BORROW.BORROW]: defineMessages({
    title: {
      defaultMessage: 'Borrow',
      description: 'borrow title',
    },
  }),

  [LEND_BORROW.LEND]: defineMessages({
    title: {
      defaultMessage: 'Lend',
      description: 'lend title',
    },
  }),
} as Record<LEND_BORROW, MessageData>;
