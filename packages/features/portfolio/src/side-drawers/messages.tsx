import { PORTFOLIO_ACTIONS } from '@notional-finance/shared-config';
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
    inputLabel: {
      defaultMessage: 'Enter the amount to deposit',
      description: '',
    },
  }),
  [PORTFOLIO_ACTIONS.REPAY_DEBT]: defineMessages({
    heading: { defaultMessage: 'Repay Debt', description: '' },
    helptext: {
      defaultMessage: 'Repay your debt before maturity at the market rate.',
      description: '',
    },
    inputLabel: {
      defaultMessage: 'Enter the amount of fCash to repay',
      description: '',
    },
  }),
  [PORTFOLIO_ACTIONS.CONVERT_ASSET]: defineMessages({
    heading: { defaultMessage: 'Manage Asset', description: '' },
    helptext: {
      defaultMessage: 'Repay your cash debt to avoid settlement penalties.',
      description: '',
    },
    inputLabel: {
      defaultMessage: 'Enter the amount of cash to repay',
      description: '',
    },
    fixedHeading: {
      defaultMessage: 'Convert to Fixed Maturity',
    },
    variableHeading: {
      defaultMessage: 'Convert to Variable',
    },
  }),
  [PORTFOLIO_ACTIONS.ROLL_DEBT]: defineMessages({
    heading: { defaultMessage: 'Manage Debt', description: '' },
    helptext: {
      defaultMessage: 'Manage your debt',
      description: '',
    },
    inputLabel: {
      defaultMessage: 'Enter the amount of cash to repay',
      description: '',
    },
    fixedHeading: {
      defaultMessage: 'Roll to Fixed Maturity',
    },
    variableHeading: {
      defaultMessage: 'Convert to Variable',
    },
  }),
  [PORTFOLIO_ACTIONS.WITHDRAW]: defineMessages({
    heading: { defaultMessage: 'Withdraw', description: '' },
    helptext: {
      defaultMessage:
        'Withdraw balances from Notional into the connected wallet.',
      description: '',
    },
    inputLabel: {
      defaultMessage: 'Enter the amount to withdraw',
      description: '',
    },
    cashWithdrawn: { defaultMessage: 'Cash Withdrawn', description: '' },
    nTokensRedeemed: { defaultMessage: 'nTokens Redeemed', description: '' },
    incentivesMinted: { defaultMessage: 'Incentives Minted', description: '' },
  }),
  [PORTFOLIO_ACTIONS.DELEVERAGE]: defineMessages({
    heading: { defaultMessage: 'Deleverage', description: '' },
    helptext: {
      defaultMessage:
        'Reduce your interest rate risk by redeeming nTokens and repaying debt at the same time.',
      description: '',
    },
    inputLabel: {
      defaultMessage: 'Enter the amount of fCash debt to repay',
      description: '',
    },
  }),
  [PORTFOLIO_ACTIONS.GET_NOTIFIED]: defineMessages({
    heading: { defaultMessage: 'Get Notified', description: '' },
    helptext: {
      defaultMessage: 'Receive notifications for important events.',
      description: '',
    },
  }),
  [PORTFOLIO_ACTIONS.REMIND_ME]: defineMessages({
    heading: { defaultMessage: 'Remind Me', description: '' },
    helptext: {
      defaultMessage: 'Set calendar reminders for important dates.',
      description: '',
    },
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
  [PORTFOLIO_ACTIONS.MANAGE_BORROW]: defineMessages({
    heading: {
      defaultMessage: 'Roll or Convert Borrow to Variable',
      description: '',
    },
    helptext: {
      defaultMessage: 'Manage your positions.',
      description: '',
    },
  }),
  [PORTFOLIO_ACTIONS.MANAGE_LEND]: defineMessages({
    heading: {
      defaultMessage: 'Roll or Convert Lend to Variable',
      description: '',
    },
    helptext: {
      defaultMessage: 'Manage your positions.',
      description: '',
    },
  }),
};
