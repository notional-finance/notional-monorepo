import { PRODUCTS } from '@notional-finance/util';
import { defineMessages, MessageDescriptor } from 'react-intl';

interface MessageData {
  title?: MessageDescriptor;
  returnType?: MessageDescriptor;
  dataPointOneTitle?: MessageDescriptor;
  dataPointTwoTitle?: MessageDescriptor;
}

// LEND, BORROW, PROVIDE LIQUIDITY, STAKE

export const messages = {
  [PRODUCTS.BORROW_FIXED]: defineMessages({
    title: {
      defaultMessage: 'Borrow',
      description: 'borrow title',
    },
    returnType: {
      defaultMessage: 'Fixed APY',
      description: 'return type',
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
  [PRODUCTS.BORROW_VARIABLE]: defineMessages({
    title: {
      defaultMessage: 'Borrow',
      description: 'borrow title',
    },
    returnType: {
      defaultMessage: 'Variable APY',
      description: 'return type',
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

  [PRODUCTS.LEND_FIXED]: defineMessages({
    title: {
      defaultMessage: 'Lend',
      description: 'lend title',
    },
    returnType: {
      defaultMessage: 'Fixed APY',
      description: 'return type',
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

  [PRODUCTS.LEND_VARIABLE]: defineMessages({
    title: {
      defaultMessage: 'Lend',
      description: 'lend title',
    },
    returnType: {
      defaultMessage: 'Variable APY',
      description: 'return type',
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
  [PRODUCTS.LIQUIDITY_VARIABLE]: defineMessages({
    returnType: {
      defaultMessage: 'Total APY',
      description: 'return type',
    },
    dataPointOneTitle: {
      defaultMessage: 'Variable APY',
      description: 'data point one description',
    },
    dataPointTwoTitle: {
      defaultMessage: 'NOTE Incentive Yield',
      description: 'data point one description',
    },
  }),
  [PRODUCTS.LIQUIDITY_LEVERAGED]: defineMessages({
    returnType: {
      defaultMessage: 'Total APY',
      description: 'return type',
    },
    dataPointOneTitle: {
      defaultMessage: 'Leveraged APY',
      description: 'data point one description',
    },
    dataPointTwoTitle: {
      defaultMessage: 'NOTE Incentive Yield',
      description: 'data point one description',
    },
  }),
  // [NOTIONAL_CATEGORIES.STAKE]: defineMessages({
  //   returnType: {
  //     defaultMessage: 'APY',
  //     description: 'return type',
  //   },
  //   dataPointOneTitle: {
  //     defaultMessage: 'Total sNOTE Value',
  //     description: 'data point one description',
  //   },
  //   dataPointTwoTitle: {
  //     defaultMessage: 'Annual Reward Rate',
  //     description: 'data point one description',
  //   },
  // }),
} as Record<PRODUCTS, MessageData>;
