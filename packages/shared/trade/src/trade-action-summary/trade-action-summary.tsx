import { ReactNode } from 'react';
import { Box, useTheme } from '@mui/material';
import {
  TradeActionHeader,
  PageLoading,
  TradeSummaryContainer,
  TradeActionTitle,
  H4,
} from '@notional-finance/mui';
import { BaseTradeState, isLeveragedTrade } from '@notional-finance/notionable';
import { TransactionHeadings } from '../transaction-sidebar/components/transaction-headings';
import { FormattedMessage, defineMessage } from 'react-intl';
import { useAllMarkets } from '@notional-finance/notionable-hooks';
import {
  LeverageInfoRow,
  LiquidityYieldInfo,
  NativeYieldPopup,
} from './components';
import { formatTokenType } from '@notional-finance/helpers';
import { TokenDefinition, YieldData } from '@notional-finance/core-entities';
import { leveragedYield, pointsMultiple } from '@notional-finance/util';

interface TradeActionSummaryProps {
  state: BaseTradeState;
  liquidityYieldData?: YieldData;
  priorVaultFactors?: {
    vaultShare?: TokenDefinition;
    vaultBorrowRate?: number;
    leverageRatio?: number;
  };
  children?: ReactNode | ReactNode[];
}

export function TradeActionSummary({
  state,
  priorVaultFactors,
  liquidityYieldData,
  children,
}: TradeActionSummaryProps) {
  const theme = useTheme();
  const {
    tradeType,
    deposit,
    debt,
    collateralOptions,
    debtOptions,
    vaultConfig,
    riskFactorLimit,
    vaultAddress,
    selectedNetwork,
  } = state;
  const isVault = !!vaultAddress;
  const { nonLeveragedYields } = useAllMarkets(selectedNetwork);

  const messages = tradeType ? TransactionHeadings[tradeType] : undefined;
  const headerText =
    messages?.headerText || defineMessage({ defaultMessage: 'unknown ' });
  const isLeveraged =
    isLeveragedTrade(tradeType) || priorVaultFactors !== undefined;
  const collateral = state.collateral || priorVaultFactors?.vaultShare;

  const apySuffix = isLeveraged ? (
    <FormattedMessage defaultMessage={'Total APY'} />
  ) : tradeType === 'LendFixed' || tradeType === 'BorrowFixed' ? (
    <FormattedMessage defaultMessage={'Fixed APY'} />
  ) : (
    <FormattedMessage defaultMessage={'APY'} />
  );

  const selectedToken =
    (tradeType === 'LeveragedLend' ||
      tradeType === 'LeveragedNToken' ||
      tradeType === 'MintNToken') &&
    collateral
      ? formatTokenType(collateral).icon
      : deposit?.symbol;

  const tokenBottom =
    (tradeType === 'LeveragedNToken' || tradeType === 'LeveragedLend') && debt
      ? formatTokenType(debt).icon
      : undefined;

  const nonLeveragedYield = nonLeveragedYields.find(
    (y) => y.token.id === collateral?.id
  );
  const points = nonLeveragedYield?.pointMultiples;
  const assetAPY =
    collateralOptions?.find((c) => c.token.id === collateral?.id)
      ?.interestRate || nonLeveragedYield?.totalAPY;

  const debtAPY =
    debtOptions?.find((d) => d.token.id === debt?.id)?.interestRate ||
    nonLeveragedYields.find((y) => y.token.id === debt?.id)?.totalAPY ||
    priorVaultFactors?.vaultBorrowRate;

  const apySpread =
    assetAPY !== undefined && debtAPY !== undefined
      ? assetAPY - debtAPY
      : undefined;
  const leverageRatio =
    riskFactorLimit?.riskFactor === 'leverageRatio'
      ? (riskFactorLimit.limit as number)
      : priorVaultFactors?.leverageRatio;

  let totalAPY: number | undefined;
  if (isLeveraged) {
    totalAPY = leveragedYield(assetAPY, debtAPY, leverageRatio);
  } else {
    totalAPY = assetAPY !== undefined ? assetAPY : debtAPY;
  }
  const { title } = collateral
    ? formatTokenType(collateral)
    : isVault
    ? { title: 'Vault Shares' }
    : { title: '' };

  if (!selectedToken) return <PageLoading />;

  return (
    <TradeSummaryContainer>
      <Box marginBottom={theme.spacing(5)}>
        <TradeActionHeader
          token={selectedToken}
          tokenBottom={tokenBottom}
          actionText={
            isVault ? (
              vaultConfig?.name
            ) : (
              <FormattedMessage
                {...headerText}
                values={{ token: deposit?.symbol || '' }}
              />
            )
          }
        />
        <TradeActionTitle
          value={totalAPY}
          title={apySuffix}
          valueSuffix="%"
          hasPoints={!!points}
          InfoComp={
            totalAPY ? (
              <NativeYieldPopup selectedToken={deposit?.symbol || ''} />
            ) : undefined
          }
        />
        {points && (
          <H4 sx={{ marginTop: theme.spacing(1) }} accent>{`${Object.keys(
            points
          )
            .map(
              (k) =>
                `${pointsMultiple(points[k], leverageRatio).toFixed(2)}x ${k}`
            )
            .join(' & ')} Points`}</H4>
        )}
        {liquidityYieldData && (
          <LiquidityYieldInfo liquidityYieldData={liquidityYieldData} />
        )}
        {isLeveraged && (
          <LeverageInfoRow
            assetSymbol={title}
            assetAPY={assetAPY}
            apySpread={apySpread}
            leverage={leverageRatio}
          />
        )}
      </Box>
      {children}
    </TradeSummaryContainer>
  );
}

export default TradeActionSummary;
