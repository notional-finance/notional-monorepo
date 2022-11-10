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
    defaultMessage: 'Error calculating withdraw: {e}',
    description: 'error message',
  },
});
