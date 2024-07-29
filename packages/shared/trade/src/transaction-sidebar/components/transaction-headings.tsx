import { AllTradeTypes } from '@notional-finance/notionable';
import { MessageDescriptor, defineMessages } from 'react-intl';
export type CombinedTokenTypes =
  | 'fCash-PrimeDebt'
  | 'PrimeDebt-fCash'
  | 'PrimeCash-fCash'
  | 'fCash-PrimeCash'
  | 'fCash-fCash'
  | 'nToken-PrimeCash'
  | 'nToken-fCash'
  | 'fCash-nToken'
  | 'PrimeCash-nToken'
  | 'PrimeDebt-nToken';

export const TransactionHeadings: Record<
  AllTradeTypes,
  {
    heading: MessageDescriptor;
    helptext: MessageDescriptor;
    headerText?: MessageDescriptor;
    walletConnectedText?: MessageDescriptor;
    'fCash-PrimeDebt'?: MessageDescriptor;
    'PrimeDebt-fCash'?: MessageDescriptor;
    'PrimeCash-fCash'?: MessageDescriptor;
    'fCash-PrimeCash'?: MessageDescriptor;
    'fCash-fCash'?: MessageDescriptor;
    'nToken-PrimeCash'?: MessageDescriptor;
    'nToken-fCash'?: MessageDescriptor;
    'fCash-nToken'?: MessageDescriptor;
    'PrimeCash-nToken'?: MessageDescriptor;
    'PrimeDebt-nToken'?: MessageDescriptor;
  }
> = {
  LendFixed: defineMessages({
    heading: { defaultMessage: 'Lend Fixed' },
    helptext: {
      defaultMessage:
        'Lock in a fixed interest rate today.  Fixed rates guarantee your APY.',
    },
    headerText: { defaultMessage: 'Lend {token}' },
  }),
  LendVariable: defineMessages({
    heading: { defaultMessage: 'Lending' },
    helptext: {
      defaultMessage:
        'Earn passive income with market-leading variable interest rates and full redeemability. Withdraw your cash whenever you need it.',
    },
    headerText: { defaultMessage: 'Lend {token}' },
  }),
  LeveragedLend: defineMessages({
    heading: { defaultMessage: 'Leveraged Lending' },
    helptext: {
      defaultMessage:
        "Arbitrage Notional's interest rates by borrowing at a low rate and lending at a higher one with leverage for maximum returns.",
    },
    headerText: { defaultMessage: 'Lend {token} with Leverage' },
  }),
  BorrowFixed: defineMessages({
    heading: { defaultMessage: 'Borrow Fixed' },
    helptext: {
      defaultMessage: 'Get peace of mind with a fixed rate on your loan.',
    },
    headerText: { defaultMessage: 'Borrow {token}' },
  }),
  BorrowVariable: defineMessages({
    heading: { defaultMessage: 'Borrowing' },
    helptext: {
      defaultMessage:
        'Borrow against your crypto with full flexibility. Leave your loan open or pay it back whenever you want with no penalty.',
    },
    headerText: { defaultMessage: 'Borrow {token}' },
  }),
  MintNToken: defineMessages({
    heading: { defaultMessage: 'Provide Liquidity' },
    helptext: {
      defaultMessage:
        'Provide liquidity to all fixed rate liquidity pools in this currency at once to earn interest, fees, and NOTE incentives.',
    },
    headerText: { defaultMessage: 'Provide {token} Liquidity' },
  }),
  LeveragedNToken: defineMessages({
    heading: { defaultMessage: 'Leveraged Liquidity' },
    helptext: {
      defaultMessage:
        'Multiply your returns by providing liquidity with leverage. Select your borrow rate and leverage and put on the whole position in one transaction.',
    },
    headerText: { defaultMessage: 'Provide {token} Liquidity with Leverage' },
  }),
  IncreaseLeveragedNToken: defineMessages({
    heading: { defaultMessage: 'Leveraged Liquidity' },
    helptext: {
      defaultMessage:
        'Multiply your returns by providing liquidity with leverage. Select your borrow rate and leverage and put on the whole position in one transaction.',
    },
    headerText: { defaultMessage: 'Provide {token} Liquidity with Leverage' },
  }),
  LeveragedNTokenAdjustLeverage: defineMessages({
    heading: { defaultMessage: 'Adjust Leverage' },
    helptext: {
      defaultMessage: 'Increase or decrease your position leverage',
    },
    headerText: { defaultMessage: 'Provide {token} Liquidity with Leverage' },
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
      defaultMessage: 'Withdraw from Notional to your wallet.',
    },
  }),
  RepayDebt: defineMessages({
    heading: { defaultMessage: 'Repay Debt' },
    helptext: {
      defaultMessage: 'Repay your debt with assets from your wallet.',
    },
  }),
  Deleverage: defineMessages({
    heading: { defaultMessage: 'Deleverage' },
    helptext: {
      defaultMessage:
        'Reduce a leveraged lending or leveraged liquidity position',
    },
  }),
  ConvertAsset: defineMessages({
    heading: { defaultMessage: 'Manage Asset' },
    helptext: {
      defaultMessage: 'Convert your asset into a new asset type.',
    },
    'PrimeDebt-fCash': {
      defaultMessage: 'Convert your variable rate loan to a fixed rate',
    },
    'PrimeCash-fCash': {
      defaultMessage: 'Convert your variable rate loan to a fixed rate',
    },
    'fCash-PrimeCash': {
      defaultMessage: 'Convert your fixed rate loan to a variable rate',
    },
    'fCash-fCash': {
      defaultMessage: 'Roll your loan to a new maturity and rate',
    },
    'nToken-PrimeCash': {
      defaultMessage: 'Convert your liquidity to a variable rate loan',
    },
    'nToken-fCash': {
      defaultMessage: 'Convert your liquidity to a fixed rate loan',
    },
    'fCash-nToken': {
      defaultMessage: 'Convert your fixed rate loan to providing liquidity',
    },
    'PrimeCash-nToken': {
      defaultMessage: 'Convert your variable rate loan to providing liquidity',
    },
    'PrimeDebt-nToken': {
      defaultMessage: 'Convert your variable rate loan to providing liquidity',
    },
  }),
  RollDebt: defineMessages({
    heading: { defaultMessage: 'Manage Debt' },
    'fCash-PrimeDebt': {
      defaultMessage: 'Convert your fixed rate loan to a variable rate',
    },
    'PrimeCash-fCash': {
      defaultMessage: 'Convert your variable rate loan to a fixed rate',
    },
    'fCash-fCash': {
      defaultMessage: 'Roll your loan to a new maturity and rate',
    },
    helptext: { defaultMessage: 'Roll your debt to a new maturity' },
  }),
  DeleverageWithdraw: defineMessages({
    heading: { defaultMessage: 'Withdraw' },
    helptext: {
      defaultMessage: 'Reduce your leveraged position and withdraw assets.',
    },
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
  AdjustVaultLeverage: defineMessages({
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
  StakeNOTE: defineMessages({
    heading: { defaultMessage: 'Stake NOTE' },
    headerText: { defaultMessage: 'Stake NOTE' },
    helptext: {
      defaultMessage:
        'Staked NOTE holders provide liquidity in an 80/20 NOTE/WETH pool on Balancer.',
    },
  }),
  StakeNOTECoolDown: defineMessages({
    heading: { defaultMessage: 'Cooldown Period Initiated' },
    walletConnectedText: {
      defaultMessage: 'Cancel Cooldown',
      description: 'call to action button',
    },
    headerText: { defaultMessage: 'Stake NOTE' },
    helptext: {
      defaultMessage:
        'You will only have 3 days to redeem your sNOTE once the cooldown ends. <a>Learn More</a>',
    },
  }),
  StakeNOTERedeem: defineMessages({
    heading: { defaultMessage: 'Redeem NOTE' },
    headerText: { defaultMessage: 'Redeem NOTE' },
    helptext: {
      defaultMessage:
        'Cooldown is completed. Enter the amount of NOTE to claim. All funds not claimed in the 3 day period will continue to be staked.',
    },
  }),
};
