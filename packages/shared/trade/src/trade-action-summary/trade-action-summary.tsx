import { ReactNode } from 'react';
import {
  TradeActionHeader,
  PageLoading,
  TradeSummaryContainer,
  TradeActionTitle,
} from '@notional-finance/mui';
import { BaseTradeState, isVaultTrade } from '@notional-finance/notionable';
import { TransactionHeadings } from '../transaction-sidebar/components/transaction-headings';
import { FormattedMessage } from 'react-intl';
import { useAllMarkets } from '@notional-finance/notionable-hooks';

interface TradeActionSummaryProps {
  state: BaseTradeState;
  children?: ReactNode | ReactNode[];
}

export function TradeActionSummary({
  state,
  children,
}: TradeActionSummaryProps) {
  const {
    tradeType,
    deposit,
    collateral,
    debt,
    collateralOptions,
    debtOptions,
    vaultConfig,
    riskFactorLimit,
  } = state;
  const isVault = isVaultTrade(tradeType);
  const { nonLeveragedYields } = useAllMarkets();

  const messages = tradeType ? TransactionHeadings[tradeType] : undefined;
  const headerText = messages?.headerText;
  const isLeveraged =
    tradeType === 'LeveragedNToken' ||
    tradeType === 'LeveragedLend' ||
    isVaultTrade(tradeType);

  const apySuffix = isLeveraged ? (
    <FormattedMessage defaultMessage={'Total APY'} />
  ) : tradeType === 'LendFixed' || tradeType === 'BorrowFixed' ? (
    <FormattedMessage defaultMessage={'Fixed APY'} />
  ) : (
    <FormattedMessage defaultMessage={'APY'} />
  );

  const selectedToken =
    tradeType === 'LeveragedNToken' || tradeType === 'MintNToken'
      ? collateral?.symbol
      : deposit?.symbol;

  const assetAPY =
    collateralOptions?.find((c) => c.token.id === collateral?.id)
      ?.interestRate ||
    nonLeveragedYields.find((y) => y.token.id === collateral?.id)?.totalAPY;

  const debtAPY =
    debtOptions?.find((d) => d.token.id === debt?.id)?.interestRate ||
    nonLeveragedYields.find((y) => y.token.id === debt?.id)?.totalAPY;

  const apySpread =
    assetAPY !== undefined && debtAPY !== undefined
      ? assetAPY - debtAPY
      : undefined;
  const leverageRatio =
    riskFactorLimit?.riskFactor === 'leverageRatio'
      ? (riskFactorLimit.limit as number)
      : undefined;

  let totalAPY: number | undefined;
  if (isLeveraged) {
    totalAPY =
      leverageRatio !== undefined &&
      apySpread !== undefined &&
      assetAPY !== undefined
        ? assetAPY + apySpread * leverageRatio
        : undefined;
  } else {
    totalAPY = assetAPY !== undefined ? assetAPY : debtAPY;
  }

  if (!headerText || !selectedToken) return <PageLoading />;

  return (
    <TradeSummaryContainer>
      <TradeActionHeader
        token={selectedToken}
        hideTokenName={isVault}
        actionText={
          isVault ? vaultConfig?.name : <FormattedMessage {...headerText} />
        }
      />
      <TradeActionTitle value={totalAPY} title={apySuffix} valueSuffix="%" />
      {children}
    </TradeSummaryContainer>
  );
}

export default TradeActionSummary;
