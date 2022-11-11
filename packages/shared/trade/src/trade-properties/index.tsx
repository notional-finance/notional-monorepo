import { CountUp } from '@notional-finance/mui';
import { TypedBigNumber } from '@notional-finance/sdk';
import { RATE_PRECISION } from '@notional-finance/sdk/src/config/constants';
import { convertRateToFloat, formatMaturity } from '@notional-finance/helpers';
import { defineMessage, MessageDescriptor } from 'react-intl';

export enum TradePropertyKeys {
  deposit = 'transactionProperties.deposit',
  fromCashBalance = 'transactionProperties.fromCashBalance',
  fromWalletBalance = 'transactionProperties.fromWalletBalance',
  interestEarned = 'transactionProperties.interestEarned',
  apy = 'transactionProperties.apy',
  fCashMinted = 'transactionProperties.fCashMinted',
  maturity = 'transactionProperties.maturity',
  amountToWallet = 'transactionProperties.amountToWallet',
  amountToPortfolio = 'transactionProperties.amountToPortfolio',
  interestDue = 'transactionProperties.interestDue',
  collateralRatio = 'transactionProperties.collateralRatio',
  loanToValue = 'transactionProperties.loanToValue',
  collateralDeposit = 'transactionProperties.collateralDeposit',
  collateralType = 'transactionProperties.collateralType',
  collateralAPY = 'transactionProperties.collateralAPY',
  incentivesMinted = 'transactionProperties.incentivesMinted',
  nTokensMinted = 'transactionProperties.nTokensMinted',
  nTokensRedeemed = 'transactionProperties.nTokensRedeemed',
  nTokenShare = 'transactionProperties.nTokenShare',
  newMaturity = 'transactionProperties.newMaturity',
  newfCashAmount = 'transactionProperties.newfCashAmount',
  costToRepay = 'transactionProperties.costToRepay',
  repaymentRate = 'transactionProperties.repaymentRate',
  withdrawLendRate = 'transactionProperties.withdrawLendRate',
  leverageRatio = 'transactionProperties.leverageRatio',
  transactionCosts = 'transactionProperties.transactionCosts',
  assetsSold = 'transactionProperties.assetsSold',
  debtRepaid = 'transactionProperties.debtRepaid',
  nTokenRedeemSlippage = 'transactionProperties.nTokenRedeemSlippage',
  noteDeposit = 'transactionProperties.noteDeposit',
  ethDeposit = 'transactionProperties.ethDeposit',
  notePrice = 'transactionProperties.notePrice',
  ethReceived = 'transactionProperties.ethReceived',
  noteReceived = 'transactionProperties.noteReceived',
  sNOTERedeemed = 'transactionProperties.sNOTERedeemed',
  redeemWindowBegins = 'transactionProperties.redeemWindowBegins',
  redeemWindowEnds = 'transactionProperties.redeemWindowEnds',
  additionalDebt = 'transactionProperties.additionalDebt',
  remainingDebt = 'transactionProperties.remainingDebt',
  remainingAssets = 'transactionProperties.remainingAssets',
}

export type TradeProperties = Partial<{
  [TradePropertyKeys.maturity]: number;
  [TradePropertyKeys.newMaturity]: number;
  [TradePropertyKeys.apy]: number;
  [TradePropertyKeys.collateralRatio]: number;
  [TradePropertyKeys.loanToValue]: number;
  [TradePropertyKeys.repaymentRate]: number;
  [TradePropertyKeys.withdrawLendRate]: number;
  [TradePropertyKeys.leverageRatio]: number;
  [TradePropertyKeys.collateralAPY]: number;
  [TradePropertyKeys.collateralType]: string;
  [TradePropertyKeys.nTokenShare]: number;
  [TradePropertyKeys.notePrice]: number;
  [TradePropertyKeys.deposit]: TypedBigNumber;
  [TradePropertyKeys.fromCashBalance]: TypedBigNumber;
  [TradePropertyKeys.fromWalletBalance]: TypedBigNumber;
  [TradePropertyKeys.interestEarned]: TypedBigNumber;
  [TradePropertyKeys.fCashMinted]: TypedBigNumber;
  [TradePropertyKeys.amountToWallet]: TypedBigNumber;
  [TradePropertyKeys.amountToPortfolio]: TypedBigNumber;
  [TradePropertyKeys.interestDue]: TypedBigNumber;
  [TradePropertyKeys.collateralDeposit]: TypedBigNumber;
  [TradePropertyKeys.incentivesMinted]: TypedBigNumber;
  [TradePropertyKeys.nTokensMinted]: TypedBigNumber;
  [TradePropertyKeys.nTokensRedeemed]: TypedBigNumber;
  [TradePropertyKeys.newfCashAmount]: TypedBigNumber;
  [TradePropertyKeys.costToRepay]: TypedBigNumber;
  [TradePropertyKeys.assetsSold]: TypedBigNumber;
  [TradePropertyKeys.debtRepaid]: TypedBigNumber;
  [TradePropertyKeys.transactionCosts]: TypedBigNumber;
  [TradePropertyKeys.nTokenRedeemSlippage]: TypedBigNumber;
  [TradePropertyKeys.noteDeposit]: TypedBigNumber;
  [TradePropertyKeys.ethDeposit]: TypedBigNumber;
  [TradePropertyKeys.ethReceived]: TypedBigNumber;
  [TradePropertyKeys.noteReceived]: TypedBigNumber;
  [TradePropertyKeys.sNOTERedeemed]: TypedBigNumber;
  [TradePropertyKeys.redeemWindowBegins]: string;
  [TradePropertyKeys.redeemWindowEnds]: string;
  [TradePropertyKeys.additionalDebt]: TypedBigNumber;
  [TradePropertyKeys.remainingDebt]: TypedBigNumber;
  [TradePropertyKeys.remainingAssets]: TypedBigNumber;
}>;

const formatDisplayString = (val: TypedBigNumber) =>
  val.toDisplayStringWithSymbol(3);
const formatfCashString = (val: TypedBigNumber) =>
  val.toDisplayStringWithfCashSymbol(3);
const countUpPercentage = (val: number) => (
  <CountUp value={val} suffix="%" decimals={2} />
);
const countUpUSDAmount = (val: number) => (
  <CountUp value={val} prefix="$" decimals={2} />
);
const countUpInterestRate = (val: number) => (
  <CountUp value={convertRateToFloat(val)} suffix="% APY" decimals={2} />
);
export const countUpLeverageRatio = (val: number) => (
  <CountUp value={val / RATE_PRECISION} suffix="x" decimals={3} />
);
const identity = (val: any) => val;
type PropertyFormatter = (val: any) => React.ReactNode;

export const PropertyFormatters: Record<TradePropertyKeys, PropertyFormatter> =
  {
    [TradePropertyKeys.maturity]: formatMaturity,
    [TradePropertyKeys.newMaturity]: formatMaturity,
    [TradePropertyKeys.collateralRatio]: countUpPercentage,
    [TradePropertyKeys.nTokenShare]: countUpPercentage,
    [TradePropertyKeys.loanToValue]: countUpPercentage,
    [TradePropertyKeys.apy]: countUpInterestRate,
    [TradePropertyKeys.repaymentRate]: countUpInterestRate,
    [TradePropertyKeys.withdrawLendRate]: countUpInterestRate,
    [TradePropertyKeys.collateralAPY]: countUpPercentage,
    [TradePropertyKeys.collateralType]: identity,
    [TradePropertyKeys.leverageRatio]: countUpLeverageRatio,
    [TradePropertyKeys.notePrice]: countUpUSDAmount,
    [TradePropertyKeys.deposit]: formatDisplayString,
    [TradePropertyKeys.fromCashBalance]: formatDisplayString,
    [TradePropertyKeys.fromWalletBalance]: formatDisplayString,
    [TradePropertyKeys.interestEarned]: formatDisplayString,
    [TradePropertyKeys.amountToWallet]: formatDisplayString,
    [TradePropertyKeys.amountToPortfolio]: formatDisplayString,
    [TradePropertyKeys.interestDue]: formatDisplayString,
    [TradePropertyKeys.collateralDeposit]: formatDisplayString,
    [TradePropertyKeys.incentivesMinted]: formatDisplayString,
    [TradePropertyKeys.nTokensMinted]: formatDisplayString,
    [TradePropertyKeys.nTokensRedeemed]: formatDisplayString,
    [TradePropertyKeys.assetsSold]: formatDisplayString,
    [TradePropertyKeys.costToRepay]: formatDisplayString,
    [TradePropertyKeys.transactionCosts]: formatDisplayString,
    [TradePropertyKeys.nTokenRedeemSlippage]: formatDisplayString,
    [TradePropertyKeys.noteDeposit]: formatDisplayString,
    [TradePropertyKeys.ethDeposit]: formatDisplayString,
    [TradePropertyKeys.ethReceived]: formatDisplayString,
    [TradePropertyKeys.noteReceived]: formatDisplayString,
    [TradePropertyKeys.sNOTERedeemed]: formatDisplayString,
    [TradePropertyKeys.debtRepaid]: formatfCashString,
    [TradePropertyKeys.fCashMinted]: formatfCashString,
    [TradePropertyKeys.newfCashAmount]: formatfCashString,
    [TradePropertyKeys.redeemWindowBegins]: identity,
    [TradePropertyKeys.redeemWindowEnds]: identity,
    [TradePropertyKeys.additionalDebt]: formatfCashString,
    [TradePropertyKeys.remainingDebt]: formatDisplayString,
    [TradePropertyKeys.remainingAssets]: formatDisplayString,
  };

export const PropertyMessages: Record<TradePropertyKeys, MessageDescriptor> = {
  [TradePropertyKeys.deposit]: defineMessage({
    defaultMessage: 'Deposit',
    description: 'value label',
  }),
  [TradePropertyKeys.fromCashBalance]: defineMessage({
    defaultMessage: 'From Cash Balance',
    description: 'value label',
  }),
  [TradePropertyKeys.fromWalletBalance]: defineMessage({
    defaultMessage: 'From Wallet Balance',
    description: 'value label',
  }),
  [TradePropertyKeys.interestEarned]: defineMessage({
    defaultMessage: 'Interest Earned',
    description: 'value label',
  }),
  [TradePropertyKeys.apy]: defineMessage({
    defaultMessage: 'APY',
    description: 'value label',
  }),
  [TradePropertyKeys.fCashMinted]: defineMessage({
    defaultMessage: 'fCash Minted',
    description: 'value label',
  }),
  [TradePropertyKeys.maturity]: defineMessage({
    defaultMessage: 'Maturity',
    description: 'value label',
  }),
  [TradePropertyKeys.amountToWallet]: defineMessage({
    defaultMessage: 'Amount to Wallet',
    description: 'value label',
  }),
  [TradePropertyKeys.amountToPortfolio]: defineMessage({
    defaultMessage: 'Amount to Portfolio',
    description: 'value label',
  }),
  [TradePropertyKeys.interestDue]: defineMessage({
    defaultMessage: 'Interest Due',
    description: 'value label',
  }),
  [TradePropertyKeys.collateralRatio]: defineMessage({
    defaultMessage: 'Collateral Ratio',
    description: 'value label',
  }),
  [TradePropertyKeys.loanToValue]: defineMessage({
    defaultMessage: 'Loan to Value',
    description: 'value label',
  }),
  [TradePropertyKeys.collateralDeposit]: defineMessage({
    defaultMessage: 'Collateral Deposit',
    description: 'value label',
  }),
  [TradePropertyKeys.collateralType]: defineMessage({
    defaultMessage: 'Collateral Type',
    description: 'value label',
  }),
  [TradePropertyKeys.collateralAPY]: defineMessage({
    defaultMessage: 'Collateral APY',
    description: 'value label',
  }),
  [TradePropertyKeys.incentivesMinted]: defineMessage({
    defaultMessage: 'Incentives Minted',
    description: 'value label',
  }),
  [TradePropertyKeys.nTokensMinted]: defineMessage({
    defaultMessage: 'nTokens Minted',
    description: 'value label',
  }),
  [TradePropertyKeys.nTokensRedeemed]: defineMessage({
    defaultMessage: 'nTokens Redeemed',
    description: 'value label',
  }),
  [TradePropertyKeys.nTokenShare]: defineMessage({
    defaultMessage: 'nToken Share',
    description: 'value label',
  }),
  [TradePropertyKeys.nTokenRedeemSlippage]: defineMessage({
    defaultMessage: 'Redeem Slippage',
    description: 'value label',
  }),
  [TradePropertyKeys.newMaturity]: defineMessage({
    defaultMessage: 'New Maturity',
    description: 'value label',
  }),
  [TradePropertyKeys.newfCashAmount]: defineMessage({
    defaultMessage: 'New fCash Amount',
    description: 'value label',
  }),
  [TradePropertyKeys.costToRepay]: defineMessage({
    defaultMessage: 'Cost to Repay',
    description: 'value label',
  }),
  [TradePropertyKeys.repaymentRate]: defineMessage({
    defaultMessage: 'Repayment Rate',
    description: 'value label',
  }),
  [TradePropertyKeys.withdrawLendRate]: defineMessage({
    defaultMessage: 'Withdraw Lend Rate',
    description: 'value label',
  }),
  [TradePropertyKeys.leverageRatio]: defineMessage({
    defaultMessage: 'Leverage Ratio',
    description: 'value label',
  }),
  [TradePropertyKeys.transactionCosts]: defineMessage({
    defaultMessage: 'Transaction Costs',
    description: 'value label',
  }),
  [TradePropertyKeys.assetsSold]: defineMessage({
    defaultMessage: 'Assets Sold',
    description: 'value label',
  }),
  [TradePropertyKeys.debtRepaid]: defineMessage({
    defaultMessage: 'Debt Repaid',
    description: 'value label',
  }),
  [TradePropertyKeys.noteDeposit]: defineMessage({
    defaultMessage: 'NOTE Deposit',
    description: 'value label',
  }),
  [TradePropertyKeys.ethDeposit]: defineMessage({
    defaultMessage: 'ETH Deposit',
    description: 'value label',
  }),
  [TradePropertyKeys.notePrice]: defineMessage({
    defaultMessage: 'NOTE Price',
    description: 'value label',
  }),
  [TradePropertyKeys.ethReceived]: defineMessage({
    defaultMessage: 'ETH Received',
    description: 'value label',
  }),
  [TradePropertyKeys.noteReceived]: defineMessage({
    defaultMessage: 'NOTE Received',
    description: 'value label',
  }),
  [TradePropertyKeys.sNOTERedeemed]: defineMessage({
    defaultMessage: 'sNOTE Redeemed',
    description: 'value label',
  }),
  [TradePropertyKeys.redeemWindowBegins]: defineMessage({
    defaultMessage: 'Redeem Window Begins',
    description: 'value label',
  }),
  [TradePropertyKeys.redeemWindowEnds]: defineMessage({
    defaultMessage: 'Redeem Window Ends',
    description: 'value label',
  }),
  [TradePropertyKeys.additionalDebt]: defineMessage({
    defaultMessage: 'Additional Debt',
    description: 'value label',
  }),
  [TradePropertyKeys.remainingDebt]: defineMessage({
    defaultMessage: 'Remaining Debt',
    description: 'value label',
  }),
  [TradePropertyKeys.remainingAssets]: defineMessage({
    defaultMessage: 'Remaining Assets',
    description: 'value label',
  }),
};
