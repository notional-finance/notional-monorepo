import { TradeType } from '@notional-finance/notionable';
import { defineMessages, MessageDescriptor } from 'react-intl';

interface MessageData {
  content?: MessageDescriptor;
  toolTipContent?: MessageDescriptor;
}

export interface DetailItem {
  label:
    | React.ReactNode
    | { text: { content: MessageDescriptor }; iconColor?: string };
  value: {
    data: {
      displayValue?: React.ReactNode;
      showPositiveAsGreen?: boolean;
      isNegative?: boolean;
    }[];
  };
  showOnExpand?: boolean;
  isTotalRow?: boolean;
}

export const OrderDetailLabels = defineMessages({
  amountToWallet: { defaultMessage: 'Amount to Wallet' },
  depositFromWallet: { defaultMessage: 'Deposit from Wallet' },
  amountFromWallet: { defaultMessage: 'Amount from Wallet' },
  fCashBought: { defaultMessage: '{title} Bought ({caption})' },
  fCashSold: { defaultMessage: '{title} Sold ({caption})' },
  vaultShareMinted: { defaultMessage: '{title} Minted ({caption})' },
  vaultShareRedeemed: { defaultMessage: '{title} Redeemed ({caption})' },
  assetMinted: { defaultMessage: '{title} Minted' },
  assetRedeemed: { defaultMessage: '{title} Redeemed' },
  primeDebtBorrowed: { defaultMessage: '{title} Borrowed' },
  primeDebtRepaid: { defaultMessage: '{title} Repaid' },
  apy: { defaultMessage: '{title} APY' },
  price: { defaultMessage: '{title} Price' },
  fee: { defaultMessage: '{title} Fee' },
  captionFee: { defaultMessage: '{title} Fee ({caption})' },
  captionAPY: { defaultMessage: '{title} APY ({caption})' },
  captionPrice: { defaultMessage: '{title} Price ({caption})' },
});

export const TradeSummaryLabels = {
  VaultShare: defineMessages({
    deposit: { defaultMessage: 'Deposit and Mint Vault Shares ({caption})' },
    withdraw: { defaultMessage: 'Withdraw Vault Shares ({caption})' },
    none: { defaultMessage: 'Mint Vault Shares ({caption})' },
    repay: { defaultMessage: 'N/A' },
  }),
  fCashLend: defineMessages({
    deposit: { defaultMessage: 'Deposit and Lend Fixed ({caption})' },
    withdraw: { defaultMessage: 'Withdraw Fixed Lend ({caption})' },
    none: { defaultMessage: 'Lend Fixed ({caption})' },
    repay: { defaultMessage: 'N/A' },
  }),
  PrimeCash: defineMessages({
    deposit: { defaultMessage: 'Deposit and Lend Variable' },
    withdraw: { defaultMessage: 'Withdraw Variable Lend' },
    none: { defaultMessage: 'Lend Variable' },
    repay: { defaultMessage: 'N/A' },
  }),
  nToken: defineMessages({
    deposit: { defaultMessage: 'Deposit and Provide Liquidity' },
    withdraw: { defaultMessage: 'Withdraw Liquidity' },
    none: { defaultMessage: 'Provide Liquidity' },
    repay: { defaultMessage: 'N/A' },
  }),
  fCashDebt: defineMessages({
    deposit: { defaultMessage: 'Deposit and Repay Fixed Debt ({caption})' },
    withdraw: { defaultMessage: 'Borrow Fixed ({caption})' },
    none: { defaultMessage: 'Borrow Fixed ({caption})' },
    repay: { defaultMessage: 'Repay Fixed ({caption})' },
  }),
  PrimeDebt: defineMessages({
    deposit: { defaultMessage: 'Deposit and Repay Variable Debt' },
    withdraw: { defaultMessage: 'Borrow Variable' },
    none: { defaultMessage: 'Borrow Variable' },
    repay: { defaultMessage: 'Repay Variable Debt' },
  }),
  Underlying: defineMessages({
    deposit: { defaultMessage: 'Deposit {symbol}' },
    withdraw: { defaultMessage: 'Withdraw {symbol}' },
    none: { defaultMessage: 'Mint {symbol}' },
    repay: { defaultMessage: 'Redeem {symbol}' },
  }),
};

export const Earnings = {
  LendFixed: defineMessages({
    content: { defaultMessage: 'Earnings at Maturity' },
    toolTipContent: {
      defaultMessage:
        'Guaranteed earnings if held to maturity. You can withdraw prior to maturity subject to liquidity at a market rate.',
    },
  }),
  MintNToken: defineMessages({
    content: { defaultMessage: '30d Estimated Earnings' },
    toolTipContent: {
      defaultMessage:
        'Estimate is based on current APY. Liquidity APY can change and users are also at risk of impermanent loss.',
    },
  }),

  LendVariable: defineMessages({
    content: { defaultMessage: '30d Estimated Earnings' },
    toolTipContent: {
      defaultMessage:
        'Estimate is based on current APY. Variable lending rates can increase or decrease over time.',
    },
  }),

  LeveragedNToken: defineMessages({
    content: { defaultMessage: '30d Estimated Earnings' },
    toolTipContent: {
      defaultMessage:
        'Estimate is based on current APY. Leveraged liquidity APYs are volatile and can change quickly. Users are also at risk of impermanent loss.',
    },
  }),
  CreateVaultPosition: defineMessages({
    content: { defaultMessage: '30d Estimated Earnings' },
    toolTipContent: {
      defaultMessage:
        'Estimate is based on current APY. Leveraged vault APYs are volatile and can change quickly.',
    },
  }),
  BorrowFixed: defineMessages({
    content: { defaultMessage: 'Interest at Maturity' },
    toolTipContent: {
      defaultMessage:
        'Fixed interest due if held to maturity. You can repay prior to maturity at market rates. At maturity, fixed debts convert to variable rate.',
    },
  }),
  BorrowVariable: defineMessages({
    content: { defaultMessage: '30d Estimated Interest' },
    toolTipContent: {
      defaultMessage:
        'Estimate is based on current APY. Variable borrow rates can increase or decrease over time.',
    },
  }),
} as unknown as Record<TradeType, MessageData>;
