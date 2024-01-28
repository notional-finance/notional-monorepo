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
  insufficientFixedRateLiquidity: {
    defaultMessage: 'Insufficient Fixed Rate Liquidity',
    description: 'warning message',
  },
  insufficientFixedRateLiquidityMsg: {
    defaultMessage: 'Reduce leverage or decrease deposit to continue',
    description: 'warning message',
  },
  liquidationRisk: {
    defaultMessage: 'Liquidation Risk Too High',
    description: 'warning message',
  },
  borrowLiquidationRiskMsg: {
    defaultMessage: 'Reduce borrow amount to continue',
    description: 'warning message',
  },
  leverageLiquidationRiskMsg: {
    defaultMessage: 'Reduce leverage or increase deposit to continue',
    description: 'warning message',
  },
  usdcNotUSDCeMsg: {
    defaultMessage:
      'Insufficient balance. Notional accepts native USDC, not USDC.e on Arbitrum.',
    description: 'warning message',
  },
  exceedSupplyCap: {
    defaultMessage:
      'Supply Cap Exceeded. Max Deposit: {maxDeposit}',
    description: 'warning message',
  },
});
