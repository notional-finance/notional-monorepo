import { ReactNode } from 'react';
import { Box } from '@mui/material';
import {
  TradeActionHeader,
  PageLoading,
  TradeSummaryContainer,
  TradeActionTitle,
} from '@notional-finance/mui';
import { BaseTradeState, isVaultTrade } from '@notional-finance/notionable';
import { TransactionHeadings } from '../transaction-sidebar/components/transaction-headings';
import { FormattedMessage } from 'react-intl';
// import { MobileTradeActionSummary } from './mobile-trade-action-summary';

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

  const assetAPY = collateralOptions?.find(
    (c) => c.token.id === collateral?.id
  )?.interestRate;
  const debtAPY = debtOptions?.find(
    (d) => d.token.id === debt?.id
  )?.interestRate;
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
    totalAPY = assetAPY || debtAPY;
  }

  if (!headerText || !selectedToken) return <PageLoading />;

  return (
    <Box>
      <TradeSummaryContainer>
        <TradeActionHeader
          token={selectedToken}
          hideTokenName={isVault}
          actionText={
            isVault ? vaultConfig?.name : <FormattedMessage {...headerText} />
          }
        />
        <TradeActionTitle
          value={totalAPY}
          title={<FormattedMessage {...apySuffix} />}
          valueSuffix="%"
        />
        {children}
      </TradeSummaryContainer>
      {/* TODO: Need to decide on what data we want displayed in the component and rework it based off of that */}
      {/* <MobileTradeActionSummary
        tradeAction={tradeAction}
        selectedToken={selectedToken}
        dataPointOne={fCashAmount}
        dataPointOneSuffix={` ${selectedToken}`}
        dataPointTwo={interestAmount}
        dataPointTwoSuffix={` ${selectedToken}`}
        fixedAPY={fixedAPY}
      /> */}
    </Box>
  );
}

export default TradeActionSummary;
