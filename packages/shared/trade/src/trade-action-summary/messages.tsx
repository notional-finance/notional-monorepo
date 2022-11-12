import { NOTIONAL_CATEGORIES } from '@notional-finance/shared-config';
import { defineMessages, MessageDescriptor } from 'react-intl';

interface MessageData {
  title?: MessageDescriptor;
  dataPointOneTitle?: MessageDescriptor;
  dataPointTwoTitle?: MessageDescriptor;
}

// LEND, BORROW, PROVIDE LIQUIDITY, STAKE

export const messages = {
  [NOTIONAL_CATEGORIES.BORROW]: defineMessages({
    title: {
      defaultMessage: 'Borrow',
      description: 'borrow title',
    },
    dataPointOneTitle: {
      defaultMessage: 'Due At Maturity',
      description: 'data point one description',
    },
    dataPointTwoTitle: {
      defaultMessage: 'Interest Due',
      description: 'data point one description',
    },
  }),

  [NOTIONAL_CATEGORIES.LEND]: defineMessages({
    title: {
      defaultMessage: 'Lend',
      description: 'lend title',
    },
    dataPointOneTitle: {
      defaultMessage: 'Total At Maturity',
      description: 'data point one description',
    },
    dataPointTwoTitle: {
      defaultMessage: 'Interest Earned',
      description: 'data point one description',
    },
  }),
  [NOTIONAL_CATEGORIES.PROVIDE_LIQUIDITY]: defineMessages({
    dataPointOneTitle: {
      defaultMessage: 'Variable APY',
      description: 'data point one description',
    },
    dataPointTwoTitle: {
      defaultMessage: 'NOTE Incentive Yield',
      description: 'data point one description',
    },
  }),
  [NOTIONAL_CATEGORIES.STAKE]: defineMessages({
    dataPointOneTitle: {
      defaultMessage: 'Total sNOTE Value',
      description: 'data point one description',
    },
    dataPointTwoTitle: {
      defaultMessage: 'Annual Reward Rate',
      description: 'data point one description',
    },
  }),
} as Record<NOTIONAL_CATEGORIES, MessageData>;
