import { VAULT_ACTIONS } from '@notional-finance/shared-config';
import { defineMessages } from 'react-intl';

export const messages = {
  [VAULT_ACTIONS.ESTABLISH_ACCOUNT]: defineMessages({
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
      defaultMessage: '3. How much leverage do you want to take?',
      description: 'input label',
    },
    confirm: {
      defaultMessage: 'Create Vault Account',
      description: 'heading',
    },
  }),
  [VAULT_ACTIONS.INCREASE_POSITION]: defineMessages({
    heading: {
      defaultMessage: 'Increase Vault Position: {maturity}',
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
    depositAmount: {
      defaultMessage: '2. (Optional) Deposit to maintain your leverage ratio.',
      description: 'input label',
    },
    leverage: {
      defaultMessage: '3. Increase your leverage ratio by borrowing more.',
      description: 'input label',
    },
    confirm: {
      defaultMessage: 'Increase Vault Position',
      description: 'heading',
    },
    tabLabel: {
      defaultMessage: 'Increase Position',
      description: 'tab label',
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
    depositAmount: {
      defaultMessage: '2. (Optional) Deposit to maintain your leverage ratio.',
      description: 'input label',
    },
    leverage: {
      defaultMessage: '3. (Optional) Increase your new leverage ratio.',
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
  summary: defineMessages({
    borrowAmount: {
      defaultMessage: 'Borrow Amount: {borrowAmount}',
      description: 'input label',
    },
    expectedYield: {
      defaultMessage: 'Expected Yield',
      description: 'text label',
    },
    capacityUsed: {
      defaultMessage: 'Capacity Used: ',
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
