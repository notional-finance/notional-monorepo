import { ReactNode } from 'react';
import { Box, useTheme } from '@mui/material';
import {
  TradeActionHeader,
  PageLoading,
  TypeForm,
  TradeSummaryContainer,
  TradeActionTitle,
} from '@notional-finance/mui';
import { BaseTradeState, isVaultTrade } from '@notional-finance/notionable';
import { TransactionHeadings } from '../transaction-sidebar/components/transaction-headings';
import { FormattedMessage } from 'react-intl';
import {
  useAllMarkets,
  useSelectedNetwork,
} from '@notional-finance/notionable-hooks';
import LeverageInfoRow from './components/leverage-info-row';
import { formatTokenType } from '@notional-finance/helpers';
import { Registry, TokenDefinition } from '@notional-finance/core-entities';

interface TradeActionSummaryProps {
  state: BaseTradeState;
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
  children,
}: TradeActionSummaryProps) {
  const theme = useTheme();
  const network = useSelectedNetwork();
  const {
    tradeType,
    deposit,
    debt,
    collateralOptions,
    debtOptions,
    vaultConfig,
    riskFactorLimit,
    vaultAddress,
  } = state;
  const isVault = !!vaultAddress;
  const { nonLeveragedYields } = useAllMarkets();

  const messages = tradeType ? TransactionHeadings[tradeType] : undefined;
  const headerText = messages?.headerText;
  const isLeveraged =
    tradeType === 'LeveragedNToken' ||
    tradeType === 'LeveragedLend' ||
    isVaultTrade(tradeType) ||
    priorVaultFactors !== undefined;
  const collateral = state.collateral || priorVaultFactors?.vaultShare;

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
      : // NOTE: this is required to get the selectedToken on vault screens
      // if the trade type has not been set yet.
      isVault &&
        deposit === undefined &&
        !!network &&
        !!vaultConfig?.primaryBorrowCurrency.id
      ? Registry.getTokenRegistry().getTokenByID(
          network,
          vaultConfig.primaryBorrowCurrency.id
        )?.symbol
      : deposit?.symbol;

  const assetAPY =
    collateralOptions?.find((c) => c.token.id === collateral?.id)
      ?.interestRate ||
    nonLeveragedYields.find((y) => y.token.id === collateral?.id)?.totalAPY;

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
    totalAPY =
      leverageRatio !== undefined &&
      apySpread !== undefined &&
      assetAPY !== undefined
        ? assetAPY + apySpread * leverageRatio
        : undefined;
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
      <TypeForm />
      <Box marginBottom={theme.spacing(5)}>
        <TradeActionHeader
          token={selectedToken}
          hideTokenName={isVault}
          actionText={
            isVault ? vaultConfig?.name : <FormattedMessage {...headerText} />
          }
        />
        <TradeActionTitle value={totalAPY} title={apySuffix} valueSuffix="%" />
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
