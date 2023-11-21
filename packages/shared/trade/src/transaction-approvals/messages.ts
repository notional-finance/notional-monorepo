import { defineMessages } from 'react-intl';

export const messages = {
  tokenApproval: defineMessages({
    title: {
      defaultMessage: 'Disabled',
      description: 'title',
    },
    description: {
      defaultMessage:
        'Approving a currency is required for Notional to access funds in your wallet.',
      description: 'description',
    },
    buttonText: {
      defaultMessage: 'Approve',
      description: 'input label',
    },
  }),
  insufficientAllowance: defineMessages({
    title: {
      defaultMessage: 'Spending Cap Exceeded',
      description: 'title',
    },
    description: {
      defaultMessage:
        'Your deposit is above your set spending cap. Increase your spending cap above {depositAmount} to continue.',
      description: 'description',
    },
    buttonText: {
      defaultMessage: 'Increase',
      description: 'buttonText',
    },
  }),
  variableBorrow: defineMessages({
    title: { defaultMessage: 'Variable Borrow Disabled', description: 'title' },
    description: { defaultMessage: 'Borrowing variable must be enabled for this account on Notional.', description: 'description' },
    buttonText: {
      defaultMessage: 'Approve',
      description: '',
    },
  }),
 };
