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
  }
> = {
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
