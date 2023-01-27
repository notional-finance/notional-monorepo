import { PORTFOLIO_ACTIONS } from '@notional-finance/shared-config';
import { defineMessages } from 'react-intl';

export const messages = {
  [PORTFOLIO_ACTIONS.WITHDRAW_VAULT]: defineMessages({
    heading: { defaultMessage: 'Withdraw Position', description: '' },
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
      defaultMessage: '1. How much do you want to withdraw from your vault?',
      description: 'input label',
    },
    leverageInputLabel: {
      defaultMessage: '2. What is your target leverage ratio after withdraw?',
      description: 'input label',
    },
    fullRepaymentInfo: {
      defaultMessage:
        'Below minimum borrow size, all assets will be withdrawn.',
      description: 'info message',
    },
    unableToExit: {
      defaultMessage:
        'Unable to withdraw to target leverage ratio, reduce your withdraw amount',
      description: 'error message',
    },
    selectedLeverageRatioAboveMax: {
      defaultMessage:
        'Your account will be withdrawn to {maxLeverageRatio} leverage',
      description: 'info message',
    },
  }),
  [PORTFOLIO_ACTIONS.WITHDRAW_VAULT_POST_MATURITY]: defineMessages({
    heading: { defaultMessage: 'Withdraw Matured Position', description: '' },
    helptext: {
      defaultMessage:
        'Vault position matured, all profits will be withdrawn to your wallet.',
      description: '',
    },
    reenterVault: { defaultMessage: 'Re-Enter Vault', description: '' },
  }),
  [PORTFOLIO_ACTIONS.DELEVERAGE_VAULT]: defineMessages({
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
  [PORTFOLIO_ACTIONS.DELEVERAGE_VAULT_DEPOSIT]: defineMessages({
    heading: { defaultMessage: 'Deposit', description: '' },
    helptext: {
      defaultMessage: 'Deposit additional collateral to reduce your leverage.',
      description: '',
    },
    inputLabel: {
      defaultMessage: 'Enter amount to deposit into vault',
      description: '',
    },
    toggle: { defaultMessage: 'Deposit', description: '' },
  }),
  [PORTFOLIO_ACTIONS.DELEVERAGE_VAULT_SELL_ASSETS]: defineMessages({
    heading: { defaultMessage: 'Sell Assets', description: '' },
    helptext: {
      defaultMessage:
        'Sell vault assets and repay debt to reduce your leverage.',
      description: '',
    },
    inputLabel: {
      defaultMessage: 'Select a target leverage ratio',
      description: '',
    },
    toggle: { defaultMessage: 'Sell Assets', description: '' },
  }),
  [PORTFOLIO_ACTIONS.MANAGE_VAULT]: defineMessages({
    heading: {
      defaultMessage: 'Manage {vaultName} Vault',
      description: '',
    },
    helptext: {
      defaultMessage: 'Manage your vault position.',
      description: '',
    },
  }),
};
