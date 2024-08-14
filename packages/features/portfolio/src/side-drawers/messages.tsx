import { PORTFOLIO_ACTIONS, TABLE_WARNINGS } from '@notional-finance/util';
import { defineMessages, MessageDescriptor } from 'react-intl';

type PortfolioMessages = Record<string, MessageDescriptor>;

export const messages: Record<
  PORTFOLIO_ACTIONS | TABLE_WARNINGS,
  PortfolioMessages
> = {
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
    inputLabelTwo: {
      defaultMessage: 'Choose deposit asset type',
      description: '',
    },
  }),
  [PORTFOLIO_ACTIONS.REPAY_DEBT]: defineMessages({
    inputLabel: {
      defaultMessage: 'Choose the debt to repay',
      description: '',
    },
    inputLabelTwo: {
      defaultMessage: 'Enter amount of debt to repay',
      description: '',
    },
  }),
  [PORTFOLIO_ACTIONS.CONVERT_ASSET]: defineMessages({
    inputLabel: {
      defaultMessage: 'Enter the amount of asset to convert',
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
    inputLabel: {
      defaultMessage: 'Enter the amount of debt to roll',
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
    inputLabel: {
      defaultMessage: 'Enter the amount to withdraw',
      description: '',
    },
    inputLabelTwo: {
      defaultMessage: 'Choose asset to withdraw',
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
  [PORTFOLIO_ACTIONS.COOL_DOWN]: defineMessages({
    heading: {
      defaultMessage: 'Cool down',
      description: '',
    },
    helptext: {
      defaultMessage: 'Cool down',
      description: '',
    },
  }),
  [TABLE_WARNINGS.HIGH_UTILIZATION_NTOKEN]: defineMessages({
    title: { defaultMessage: 'Impermanent Loss', description: '' },
    message: {
      defaultMessage:
        'Fixed rate volatility has caused temporary IL. Withdrawing locks in IL.',
      description: '',
    },
  }),
  [TABLE_WARNINGS.HIGH_UTILIZATION_FCASH]: defineMessages({
    title: { defaultMessage: 'Impermanent Loss', description: '' },
    message: {
      defaultMessage:
        'Fixed rate volatility has caused temporary fCash price declines. Your fixed rate is guaranteed if you hold until maturity. Withdrawing locks in losses.',
      description: '',
    },
  }),
};
