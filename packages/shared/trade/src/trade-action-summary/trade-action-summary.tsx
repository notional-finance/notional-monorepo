import { ReactNode } from 'react';
import { Box, useTheme } from '@mui/material';
import {
  TradeActionHeader,
  PageLoading,
  TradeSummaryContainer,
  TradeActionTitle,
  H4,
  InfoTooltip,
  ReinvestPill,
} from '@notional-finance/mui';
import { BaseTradeState, isLeveragedTrade } from '@notional-finance/notionable';
import { TransactionHeadings } from '../transaction-sidebar/components/transaction-headings';
import { FormattedMessage, defineMessage } from 'react-intl';
import { useAllMarkets, useTotalAPY } from '@notional-finance/notionable-hooks';
import {
  LeverageInfoRow,
  LiquidityYieldInfo,
  NativeYieldPopup,
} from './components';
import {
  formatNumberAsPercent,
  formatTokenType,
} from '@notional-finance/helpers';
import {
  Registry,
  SingleSidedLP,
  TokenDefinition,
  YieldData,
  getVaultType,
} from '@notional-finance/core-entities';
import { MultiTokenIcon } from '@notional-finance/icons';

interface TradeActionSummaryProps {
  state: BaseTradeState;
  stakedNOTEApy?: number;
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
  stakedNOTEApy,
  priorVaultFactors,
  liquidityYieldData,
  children,
}: TradeActionSummaryProps) {
  const theme = useTheme();
  const {
    tradeType,
    deposit,
    debt,
    vaultConfig,
    vaultAddress,
    selectedNetwork,
  } = state;
  const isVault = !!vaultAddress;
  const {
    totalAPY,
    apySpread,
    leverageRatio,
    assetAPY,
    organicAPY,
    incentiveAPY,
  } = useTotalAPY(state, priorVaultFactors);
  const vaultType =
    vaultAddress && selectedNetwork
      ? getVaultType(vaultAddress, selectedNetwork)
      : undefined;

  const allMarkets = useAllMarkets(selectedNetwork);
  const messages = tradeType ? TransactionHeadings[tradeType] : undefined;
  const headerText =
    messages?.headerText || defineMessage({ defaultMessage: 'unknown ' });
  const isLeveraged =
    isLeveragedTrade(tradeType) || priorVaultFactors !== undefined;
  const collateral = state.collateral || priorVaultFactors?.vaultShare;

  const adapter =
    selectedNetwork && vaultAddress
      ? Registry.getVaultRegistry().getVaultAdapter(
          selectedNetwork,
          vaultAddress
        )
      : undefined;

  let rewardTokens: TokenDefinition[] = [];
  if (vaultType === 'SingleSidedLP_DirectClaim' && selectedNetwork) {
    rewardTokens = (adapter as SingleSidedLP).rewardTokens.map((t) =>
      Registry.getTokenRegistry().getTokenByID(selectedNetwork, t)
    );
  }

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
      tradeType === 'MintNToken' ||
      tradeType === 'StakeNOTE' ||
      tradeType === 'StakeNOTECoolDown') &&
    collateral
      ? formatTokenType(collateral).icon
      : deposit?.symbol;

  const tokenBottom =
    (tradeType === 'LeveragedNToken' || tradeType === 'LeveragedLend') && debt
      ? formatTokenType(debt).icon
      : undefined;

  const nonLeveragedYield = allMarkets.nonLeveragedYields.find(
    (y) => y.token.id === collateral?.id
  );
  const points = nonLeveragedYield?.pointMultiples;

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
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <TradeActionTitle
            value={totalAPY || stakedNOTEApy}
            title={apySuffix}
            valueSuffix="%"
            hasPoints={!!points}
            InfoComp={
              totalAPY ? (
                <NativeYieldPopup selectedToken={deposit?.symbol || ''} />
              ) : undefined
            }
          />
          {state.vaultAddress && vaultType === 'SingleSidedLP_AutoReinvest' && (
            <ReinvestPill
              vaultType={vaultType}
              sx={{
                marginBottom: '0px',
                height: 'fit-content',
                marginTop: theme.spacing(1),
                marginLeft: theme.spacing(2),
              }}
            />
          )}
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {(vaultType === 'SingleSidedLP_DirectClaim' ||
            vaultType === 'SingleSidedLP_Points') && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                marginTop: theme.spacing(1),
              }}
            >
              <H4 sx={{ marginRight: theme.spacing(2) }}>
                Organic APY:{' '}
                {organicAPY !== undefined
                  ? formatNumberAsPercent(organicAPY)
                  : '-'}
              </H4>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <H4 sx={{ marginRight: theme.spacing(0.5) }}>Reward APY: </H4>
                {vaultType === 'SingleSidedLP_DirectClaim' && rewardTokens && (
                  <MultiTokenIcon
                    symbols={rewardTokens.map((t) => t.symbol)}
                    size="medium"
                    shiftSize={8}
                  />
                )}
                <H4 sx={{ marginLeft: theme.spacing(0.5) }}>
                  {incentiveAPY !== undefined
                    ? formatNumberAsPercent(incentiveAPY)
                    : '-'}
                </H4>
              </Box>
              <InfoTooltip
                iconSize={theme.spacing(2)}
                iconColor={theme.palette.info.dark}
                toolTipText={defineMessage({
                  defaultMessage:
                    'Point values used are estimates. True values are not known. True values may be very different and will significantly impact total APY.',
                })}
                sx={{
                  marginLeft: theme.spacing(0.5),
                }}
              />
            </Box>
          )}
          {state.vaultAddress &&
            (vaultType === 'SingleSidedLP_DirectClaim' ||
              vaultType === 'SingleSidedLP_Points') && (
              <ReinvestPill
                vaultType={vaultType}
                sx={{
                  marginBottom: '0px',
                  height: 'fit-content',
                  marginTop: theme.spacing(1),
                  marginLeft: theme.spacing(2),
                }}
              />
            )}
        </Box>
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
