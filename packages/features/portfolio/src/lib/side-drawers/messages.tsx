import { PORTFOLIO_ACTIONS } from '@notional-finance/utils';
import { defineMessages, MessageDescriptor } from 'react-intl';

interface PortfolioMessages extends Record<string, MessageDescriptor> {
  heading: MessageDescriptor;
  helptext: MessageDescriptor;
}

export const messages: Record<PORTFOLIO_ACTIONS, PortfolioMessages> = {
  [PORTFOLIO_ACTIONS.ADD_TO_CALENDAR]: defineMessages({
    heading: { defaultMessage: 'Add to Calendar', description: '' },
    helptext: {
      defaultMessage: 'Not applicable',
      description: '',
    },
  }),
  [PORTFOLIO_ACTIONS.DEPOSIT]: defineMessages({
    heading: { defaultMessage: 'Deposit Collateral', description: '' },
    helptext: {
      defaultMessage: 'Deposit collateral to decrease your liquidation risk.',
      description: '',
    },
    inputLabel: { defaultMessage: 'Enter the amount to deposit', description: '' },
  }),
  [PORTFOLIO_ACTIONS.REPAY_BORROW]: defineMessages({
    heading: { defaultMessage: 'Repay Borrow', description: '' },
    helptext: {
      defaultMessage: 'Repay your borrow before maturity at the market rate.',
      description: '',
    },
    inputLabel: { defaultMessage: 'Enter the amount of fCash to repay', description: '' },
  }),
  [PORTFOLIO_ACTIONS.REPAY_CASH_DEBT]: defineMessages({
    heading: { defaultMessage: 'Repay Cash Debt', description: '' },
    helptext: {
      defaultMessage: 'Repay your cash debt to avoid settlement penalties.',
      description: '',
    },
    inputLabel: { defaultMessage: 'Enter the amount of cash to repay', description: '' },
  }),
  [PORTFOLIO_ACTIONS.REPAY_IFCASH_BORROW]: defineMessages({
    heading: { defaultMessage: 'Repay Idiosyncratic Debt', description: '' },
    helptext: {
      defaultMessage:
        'This debt can be collateralized by depositing cash of the same currency. This will act as an effective repayment and significantly reduce your liquidation risk.',
      description: '',
    },
    inputLabel: { defaultMessage: 'Enter the amount of cash to deposit', description: '' },
  }),
  [PORTFOLIO_ACTIONS.WITHDRAW]: defineMessages({
    heading: { defaultMessage: 'Withdraw', description: '' },
    helptext: {
      defaultMessage: 'Withdraw balances from Notional into the connected wallet.',
      description: '',
    },
    inputLabel: { defaultMessage: 'Enter the amount to withdraw', description: '' },
    cashWithdrawn: { defaultMessage: 'Cash Withdrawn', description: '' },
    nTokensRedeemed: { defaultMessage: 'nTokens Redeemed', description: '' },
    incentivesMinted: { defaultMessage: 'Incentives Minted', description: '' },
  }),
  [PORTFOLIO_ACTIONS.CONVERT_CASH]: defineMessages({
    heading: { defaultMessage: 'Convert Cash to nTokens', description: '' },
    helptext: {
      defaultMessage:
        'Convert Notional cash deposits (denominated in cTokens) to nTokens to earn additional yield.',
      description: '',
    },
    inputLabel: {
      defaultMessage: 'Enter the amount of cash to convert to nTokens',
      description: '',
    },
  }),
  [PORTFOLIO_ACTIONS.DELEVERAGE]: defineMessages({
    heading: { defaultMessage: 'Deleverage', description: '' },
    helptext: {
      defaultMessage:
        'Reduce your interest rate risk by redeeming nTokens and repaying debt at the same time.',
      description: '',
    },
    inputLabel: { defaultMessage: 'Enter the amount of fCash debt to repay', description: '' },
  }),
  // [PORTFOLIO_ACTIONS.DELEVERAGE_IDIOSYNCRATIC]: defineMessages({
  // "view.portfolio.actions.deleverage-idiosyncratic.heading: { defaultMessage: "Deleverage Idiosyncratic fCash", description: ""},
  // "view.portfolio.actions.deleverage-idiosyncratic.helptext: { defaultMessage: "Reduce your interest rate risk by redeeming nTokens to cash, this debt is idiosyncratic and cannot be traded on chain at the moment.", description: ""},
  // "view.portfolio.actions.deleverage-idiosyncratic.inputLabel: { defaultMessage: "Enter the amount of nTokens to redeem", description: ""},
  // })
  [PORTFOLIO_ACTIONS.WITHDRAW_LEND]: defineMessages({
    heading: { defaultMessage: 'Withdraw Lend', description: '' },
    helptext: {
      defaultMessage: 'Withdraw fCash for underlying cash at current market rates.',
      description: '',
    },
    inputLabel: { defaultMessage: 'Enter the amount of fCash to withdraw', description: '' },
    withdrawToPortfolio: { defaultMessage: 'Withdraw to Portfolio', description: '' },
    withdrawRate: { defaultMessage: 'Withdraw Rate', description: '' },
    cashToWallet: { defaultMessage: 'Cash to Wallet', description: '' },
  }),
  [PORTFOLIO_ACTIONS.ROLL_MATURITY]: defineMessages({
    heading: { defaultMessage: 'Roll Maturity', description: '' },
    helptext: {
      defaultMessage:
        'Move your loan to a new maturity at a new market rate. Your current loan will be exchanged for a new loan at the selected maturity',
      description: '',
    },
    inputLabel: { defaultMessage: '1. Select a maturity and fix your APR', description: '' },
    partialRoll: { defaultMessage: 'Partial Roll', description: '' },
    partialRollInputLabel: {
      defaultMessage: '2. Enter the portion of your loan to roll',
      description: '',
    },
  }),
  [PORTFOLIO_ACTIONS.REDEEM_NTOKEN]: defineMessages({
    heading: { defaultMessage: 'Redeem nTokens to Cash', description: '' },
    helptext: {
      defaultMessage:
        'Redeem nTokens to a cash balance manually, you will have to withdraw cTokens in a separate transaction after this is done.',
      description: '',
    },
    inputLabel: { defaultMessage: 'Enter amount of nTokens to redeem', description: '' },
    cashToPortfolio: { defaultMessage: 'Cash to Portfolio', description: '' },
    redemptionFees: { defaultMessage: 'Redemption Fees', description: '' },
    incentivesMinted: { defaultMessage: 'Incentives Minted', description: '' },
  }),
  [PORTFOLIO_ACTIONS.WITHDRAW_VAULT]: defineMessages({
    heading: { defaultMessage: 'Withdraw Position', description: '' },
    cta: { defaultMessage: 'Withdraw', description: '' },
    tooltip: { defaultMessage: 'Withdraw from your vault position.', description: '' },
    helptext: {
      defaultMessage: 'Withdraw from your vault position fully or to a new leverage ratio.',
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
      defaultMessage: 'Below minimum borrow size, all debts will be repaid.',
      description: 'info message',
    },
    unableToExit: {
      defaultMessage: 'Unable to withdraw to target leverage ratio, reduce your withdraw amount',
      description: 'error message',
    },
    selectedLeverageRatioAboveMax: {
      defaultMessage: 'Your account will be withdrawn to {maxLeverageRatio} leverage',
      description: 'info message',
    },
  }),
  [PORTFOLIO_ACTIONS.WITHDRAW_VAULT_POST_MATURITY]: defineMessages({
    heading: { defaultMessage: 'Withdraw Matured Position', description: '' },
    helptext: {
      defaultMessage: 'Vault position matured, all profits will be withdrawn to your wallet.',
      description: '',
    },
    reenterVault: { defaultMessage: 'Re-Enter Vault', description: '' },
  }),
  [PORTFOLIO_ACTIONS.DELEVERAGE_VAULT]: defineMessages({
    heading: { defaultMessage: 'Deleverage Vault', description: 'heading' },
    helptext: {
      defaultMessage: 'De-risk your vault position by repaying debts and reducing your leverage.',
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
    inputLabel: { defaultMessage: 'Enter amount to deposit into vault', description: '' },
    toggle: { defaultMessage: 'Deposit', description: '' },
  }),
  [PORTFOLIO_ACTIONS.DELEVERAGE_VAULT_SELL_ASSETS]: defineMessages({
    heading: { defaultMessage: 'Sell Assets', description: '' },
    helptext: {
      defaultMessage: 'Sell vault assets and repay debt to reduce your leverage.',
      description: '',
    },
    inputLabel: { defaultMessage: 'Select a target leverage ratio', description: '' },
    toggle: { defaultMessage: 'Sell Assets', description: '' },
  }),
  [PORTFOLIO_ACTIONS.GET_NOTIFIED]: defineMessages({
    heading: { defaultMessage: 'Get Notified', description: '' },
    helptext: { defaultMessage: 'Receive notifications for important events.', description: '' },
  }),
  [PORTFOLIO_ACTIONS.REMIND_ME]: defineMessages({
    heading: { defaultMessage: 'Remind Me', description: '' },
    helptext: { defaultMessage: 'Set calendar reminders for important dates.', description: '' },
  }),
  // heading": "Deleverage Vault", description: ""},
  // cta": "Deleverage", description: ""},
  // tooltip": "", description: ""},
};
