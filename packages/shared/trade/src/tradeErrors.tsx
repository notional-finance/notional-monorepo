import { defineMessages } from 'react-intl';

export const tradeErrors = defineMessages({
  selectMaturityToCompleteTrade: {
    defaultMessage: 'Select a maturity above to complete trade',
    description: 'error message',
  },
  insufficientBalance: {
    defaultMessage: 'Insufficient balance',
    description: 'error message',
  },
  insufficientAllowance: {
    defaultMessage: 'Insufficient ERC20 allowance',
    description: 'error message',
  },
  insufficientLiquidity: {
    defaultMessage: 'Insufficient Liquidity',
    description: 'error message',
  },
  errorCalculatingWithdraw: {
    defaultMessage: '{e}, accept residuals to continue.',
    description: 'error message',
  },
  negativeCashWarningOnDeposit: {
    defaultMessage:
      'Debt balance of {cashBalance} must be repaid during deposit.',
    description: 'warning message',
  },
  negativeCashWarningOnBorrow: {
    defaultMessage:
      'Debt balance of {cashBalance} must be repaid during borrow.',
    description: 'warning message',
  },
  insufficientCollateral: {
    defaultMessage: 'Insufficient Collateral',
    description: 'warning message',
  },
});
