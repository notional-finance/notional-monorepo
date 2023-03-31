import {
  VAULT_ACTIONS,
  PORTFOLIO_ACTIONS,
} from '@notional-finance/shared-config';
import { defineMessages } from 'react-intl';

export const messages = {
  [VAULT_ACTIONS.CREATE_VAULT_POSITION]: defineMessages({
    heading: {
      defaultMessage: 'Create Vault Position',
      description: 'heading',
    },
    helptext: {
      defaultMessage:
        'Create a new vault position with a deposit, minimum deposit amount: {minDepositRequired}',
      description: 'helptext',
    },
    maturity: {
      defaultMessage: '1. Select a maturity and fixed borrowing rate',
      description: 'input label',
    },
    depositAmount: {
      defaultMessage: '2. How much do you want to deposit?',
      description: 'input label',
    },
    leverage: {
      defaultMessage: '3. Specify a leverage amount',
      description: 'input label',
    },
    confirm: {
      defaultMessage: 'Create Vault Account',
      description: 'heading',
    },
  }),
  [VAULT_ACTIONS.INCREASE_POSITION]: defineMessages({
    heading: {
      defaultMessage: 'Increase Vault Position',
      description: 'heading',
    },
    helptext: {
      defaultMessage:
        'Increase your existing vault position by depositing or borrowing.',
      description: 'helptext',
    },
    maturity: {
      defaultMessage: '1. You will borrow at this maturity and fixed rate.',
      description: 'input label',
    },
    leverage: {
      defaultMessage: '2. Adjust Leverage (Optional)',
      description: 'input label',
    },
    confirm: {
      defaultMessage: 'Increase Vault Position',
      description: 'heading',
    },
    inputLabel: {
      defaultMessage: '1. Enter Amount to Deposit',
      description: 'input label',
    },
  }),
  [VAULT_ACTIONS.WITHDRAW_VAULT]: defineMessages({
    heading: { defaultMessage: 'Withdraw', description: '' },
    cta: { defaultMessage: 'Withdraw', description: '' },
    tooltip: {
      defaultMessage: 'Withdraw from your vault position.',
      description: '',
    },
    helptext: {
      defaultMessage:
        'Withdraw from your vault position fully or to a new leverage ratio.',
      description: 'helptext',
    },
    inputLabel: {
      defaultMessage: 'How much do you want to withdraw from your vault?',
      description: 'input label',
    },
    fullRepaymentInfo: {
      defaultMessage:
        'Below minimum borrow size, all assets will be withdrawn.',
      description: 'info message',
    },
    aboveMaxWithdraw: {
      defaultMessage: 'Cannot withdraw above maximum: {maxWithdraw}',
      description: 'error message',
    },
  }),
  [VAULT_ACTIONS.WITHDRAW_VAULT_POST_MATURITY]: defineMessages({
    heading: { defaultMessage: 'Withdraw Matured Position', description: '' },
    helptext: {
      defaultMessage:
        'Vault position matured, all profits will be withdrawn to your wallet.',
      description: '',
    },
    reenterVault: { defaultMessage: 'Re-Enter Vault', description: '' },
  }),
  /*
  [VAULT_ACTIONS.DELEVERAGE_VAULT]: defineMessages({
    heading: { defaultMessage: 'Deleverage Vault', description: 'heading' },
    helptext: {
      defaultMessage:
        'De-risk your vault position by repaying debts and reducing your leverage.',
      description: 'helptext',
    },
    aboveMaxLeverageError: {
      defaultMessage: 'Must Reduce Leverage Below: {maxLeverage}',
      description: 'error message',
    },
    fullExitInfo: {
      defaultMessage: 'Below minimum vault requirements. Full exit required.',
      description: 'info message',
    },
    belowMinLeverageError: {
      defaultMessage: 'Below Minimum Leverage for Vault: {minLeverage}',
      description: 'error message',
    },
  }),
  [VAULT_ACTIONS.DELEVERAGE_VAULT_DEPOSIT]: defineMessages({
    heading: { defaultMessage: 'Deposit', description: '' },
    helptext: {
      defaultMessage: 'Deposit additional collateral to reduce your leverage.',
      description: '',
    },
    inputLabel: {
      defaultMessage: '1. Enter amount to deposit into vault',
      description: '',
    },
    toggle: { defaultMessage: 'Deposit', description: '' },
  }),
  */
  [VAULT_ACTIONS.WITHDRAW_AND_REPAY_DEBT]: defineMessages({
    heading: {
      defaultMessage: 'Repay Debt with Vault Assets',
      description: '',
    },
    helptext: {
      defaultMessage:
        'Repay debt with vault assets in order to reduce your leverage ratio.',
      description: '',
    },
    leverage: {
      defaultMessage: 'Reduce your leverage:',
      description: 'slider label',
    },
    leverageTooHigh: {
      defaultMessage: 'Selected leverage ratio is too high.',
      description: 'error message',
    },
    fullRepaymentInfo: {
      defaultMessage:
        'Below minimum borrow size, all assets will be withdrawn.',
      description: 'info message',
    },
  }),
  [PORTFOLIO_ACTIONS.MANAGE_VAULT]: defineMessages({
    heading: {
      defaultMessage: 'Manage Vault',
      description: '',
    },
    headingTwo: {
      defaultMessage: 'Your {vaultName} Vault Position',
      description: '',
    },
    helptext: {
      defaultMessage: 'Manage your vault position.',
      description: '',
    },
  }),
  [VAULT_ACTIONS.ROLL_POSITION]: defineMessages({
    heading: {
      defaultMessage: 'Roll Vault Position',
      description: 'heading',
    },
    helptext: {
      defaultMessage:
        'Borrow from a longer term maturity to avoid settlement, minimum borrow size: {minBorrowSize}',
      description: 'helptext',
    },
    maturity: {
      defaultMessage: '1. Select a new maturity and new fixed borrowing rate.',
      description: 'input label',
    },
    inputLabel: {
      defaultMessage: '2. Deposit to maintain your leverage ratio (Optional)',
      description: 'input label',
    },
    leverage: {
      defaultMessage: '3. Adjust Leverage (Optional)',
      description: 'input label',
    },
    confirm: {
      defaultMessage: 'Roll Vault Position',
      description: 'heading',
    },
    tabLabel: {
      defaultMessage: 'Roll Position',
      description: 'tab label',
    },
  }),
  [VAULT_ACTIONS.DEPOSIT_COLLATERAL]: defineMessages({
    heading: { defaultMessage: 'Deposit Collateral', description: '' },
    inputLabel: {
      defaultMessage: '1. Enter Deposit Amount',
      description: '',
    },
    leverage: {
      defaultMessage: '2. Change Leverage (Optional)',
      description: '',
    },
    helptext: {
      defaultMessage:
        'Deposit additional collateral from your wallet to reduce the leverage in your vault.',
      description: '',
    },
    belowMinLeverageError: {
      defaultMessage: 'Below Minimum Leverage for Vault',
      description: 'error message',
    },
  }),
  summary: defineMessages({
    borrowAmount: {
      defaultMessage: 'Borrow Amount: {borrowAmount}',
      description: 'input label',
    },
    expectedYield: {
      defaultMessage: 'Expected Yield',
      description: 'text label',
    },
    capacityRemaining: {
      defaultMessage: 'Capacity Remaining: ',
      description: 'text label',
    },
    totalCapacity: {
      defaultMessage: 'Total Capacity: ',
      description: 'text label',
    },
    performance: {
      defaultMessage: 'Performance to Date',
      description: 'table column heading',
    },
    date: { defaultMessage: 'Date: {date}', description: 'chart tooltip' },
    performanceStrategyReturns: {
      defaultMessage: 'Strategy Returns: {returns}',
      description: 'chart tooltip',
    },
    performanceLeveragedReturns: {
      defaultMessage: 'Leveraged Returns: {returns}',
      description: 'chart tooltip',
    },
    returns: {
      defaultMessage: 'Unleveraged Returns',
      description: 'section heading',
    },
    leveragedReturns: {
      defaultMessage: 'Returns at {leverageRatio} Leverage',
      description: 'section heading',
    },
    currentBorrowRate: {
      defaultMessage: 'Current Borrow Rate',
      description: 'chart legend',
    },
    returnsDrivers: {
      defaultMessage: 'Returns Drivers',
      description: 'section heading',
    },
    returnsDriversSource: {
      defaultMessage: 'Source',
      description: 'table column heading',
    },
    returnsDrivers7dayAverage: {
      defaultMessage: '7 Day Avg',
      description: 'table column heading',
    },
    returnsDrivers30dayAverage: {
      defaultMessage: '30 Day Avg',
      description: 'table column',
    },
    strategyOverviewHeading: {
      defaultMessage: 'Strategy Overview',
      description: 'section heading',
    },
    strategyOverviewDocumentation: {
      defaultMessage: 'Documentation',
      description: 'documentation link',
    },
    strategyOverviewFinancialModel: {
      defaultMessage: 'Financial Model',
      description: 'documentation link',
    },
    transactionCostToolTip: {
      defaultMessage:
        'Transaction costs are paid on entry and exit. They include trading fees paid to Notional as well as any other fees incurred from trading on decentralized exchanges.',
      description: 'transaction cost tooltip',
    },
  }),
  error: defineMessages({
    noEligibleMarkets: {
      defaultMessage: 'No Eligible Markets',
      description: 'section heading',
    },
    returnToPortfolio: {
      defaultMessage: 'Return to Portfolio',
      description: 'button link',
    },
    underMinBorrow: {
      defaultMessage:
        'Below {minBorrowSize} minimum borrow amount: {borrowAmount}',
      description: 'error message',
    },
    overCapacity: {
      defaultMessage: 'Over maximum vault capacity.',
      description: 'error message',
    },
    noEligibleMarketsIdiosyncratic: {
      defaultMessage: 'No eligible markets, current maturity is idiosyncratic.',
      description: 'error message',
    },
    maturedNotSettled: {
      defaultMessage: 'Vault has matured but has not yet settled.',
      description: 'error message',
    },
    belowMinimumLeverage: {
      defaultMessage:
        'Cannot decrease below leverage ratio: {minLeverageRatio}',
      description: 'error message',
    },
    aboveMaximumLeverage: {
      defaultMessage: 'Above maximum leverage ratio: {maxLeverageRatio}',
      description: 'error message',
    },
    blockedGeoActionHelptext: {
      defaultMessage:
        'Unfortunately, leveraged vaults are not available to U.S. Persons.',
      description: 'error message',
    },
    blockedGeoCTA: {
      defaultMessage: 'Get Clarity for DeFi',
      description: 'button text',
    },
  }),
};
