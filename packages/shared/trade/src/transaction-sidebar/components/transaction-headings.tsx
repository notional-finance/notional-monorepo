import { TradeType, VaultTradeType } from '@notional-finance/notionable';
import { MessageDescriptor, defineMessages } from 'react-intl';

export const TransactionHeadings: Record<
  TradeType | VaultTradeType,
  {
    heading: MessageDescriptor;
    helptext: MessageDescriptor;
  }
> = {
  LendFixed: defineMessages({
    heading: { defaultMessage: 'Lend Fixed' },
    helptext: {
      defaultMessage:
        'Lock in a fixed interest rate today.  Fixed rates guarantee your APY.',
    },
  }),
  LendVariable: defineMessages({
    heading: { defaultMessage: 'Variable Lending' },
    helptext: {
      defaultMessage:
        'Earn passive income with market-leading variable interest rates and full redeemability. Withdraw your cash whenever you need it.',
    },
  }),
  LeveragedLend: defineMessages({
    heading: { defaultMessage: 'Leveraged Lending' },
    helptext: {
      defaultMessage:
        "Arbitrage Notional's interest rates by borrowing at a low rate and lending at a higher one with leverage for maximum returns.",
    },
  }),
  BorrowFixed: defineMessages({
    heading: { defaultMessage: 'Borrow Fixed' },
    helptext: {
      defaultMessage:
        'Borrow with confidence, fixed rates lock in what you pay.',
    },
  }),
  BorrowVariable: defineMessages({
    heading: { defaultMessage: 'Borrow Variable' },
    helptext: {
      defaultMessage: 'TBD',
    },
  }),
  MintNToken: defineMessages({
    heading: { defaultMessage: 'Provide Liquidity' },
    helptext: {
      defaultMessage:
        'You will receive nTokens in return for providing liquidity to all markets at once. nTokens earn yield from cToken supply rates, trading fees, and fCash interest. nToken holders also earn NOTE incentives.',
    },
  }),
  LeveragedNToken: defineMessages({
    heading: { defaultMessage: 'Leveraged Liquidity' },
    helptext: {
      defaultMessage:
        'Multiple your returns by providing liquidity with leverage. Select your borrow rate and leverage and put on the whole position in one transaction.',
    },
  }),
  Deposit: defineMessages({
    heading: { defaultMessage: 'Deposit Collateral' },
    helptext: {
      defaultMessage: 'Deposit collateral to decrease your liquidation risk.',
    },
  }),
  Withdraw: defineMessages({
    heading: { defaultMessage: 'Withdraw' },
    helptext: {
      defaultMessage:
        'Withdraw balances from Notional into the connected wallet.',
    },
  }),
  RepayDebt: defineMessages({
    heading: { defaultMessage: 'Repay Debt' },
    helptext: {
      defaultMessage: 'Repay your debt before maturity at the market rate.',
    },
  }),
  DeleverageLend: defineMessages({
    heading: { defaultMessage: 'Deleverage' },
    helptext: { defaultMessage: 'Deleverage a lending position' },
  }),
  DeleverageNToken: defineMessages({
    heading: { defaultMessage: 'Deleverage' },
    helptext: { defaultMessage: 'Deleverage an nToken position' },
  }),
  ConvertAsset: defineMessages({
    heading: { defaultMessage: 'Manage Asset' },
    helptext: {
      defaultMessage: 'Repay your cash debt to avoid settlement penalties.',
    },
  }),
  RollDebt: defineMessages({
    heading: { defaultMessage: 'Manage Debt' },
    helptext: { defaultMessage: 'Manage your debt' },
  }),
  /** Vault Headings **/
  CreateVaultPosition: defineMessages({
    heading: { defaultMessage: 'x' },
    helptext: { defaultMessage: 'x' },
  }),
  IncreaseVaultPosition: defineMessages({
    heading: { defaultMessage: 'x' },
    helptext: { defaultMessage: 'x' },
  }),
  DepositVaultCollateral: defineMessages({
    heading: { defaultMessage: 'x' },
    helptext: { defaultMessage: 'x' },
  }),
  RollVaultPosition: defineMessages({
    heading: { defaultMessage: 'x' },
    helptext: { defaultMessage: 'x' },
  }),
  WithdrawVault: defineMessages({
    heading: { defaultMessage: 'x' },
    helptext: { defaultMessage: 'x' },
  }),
  WithdrawAndRepayVault: defineMessages({
    heading: { defaultMessage: 'x' },
    helptext: { defaultMessage: 'x' },
  }),
};
