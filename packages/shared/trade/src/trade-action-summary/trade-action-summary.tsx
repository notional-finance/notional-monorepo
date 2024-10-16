import { ReactNode } from 'react';
import { Box, useTheme } from '@mui/material';
import {
  TradeActionHeader,
  PageLoading,
  TradeSummaryContainer,
  TradeActionTitle,
  H4,
  InfoTooltip,
} from '@notional-finance/mui';
import {
  APYData,
  BaseTradeState,
  isLeveragedTrade,
  useCurrentNetworkStore,
} from '@notional-finance/notionable';
import { TransactionHeadings } from '../transaction-sidebar/components/transaction-headings';
import { FormattedMessage, defineMessage } from 'react-intl';
import {
  usePointPrices,
  useTotalAPY,
} from '@notional-finance/notionable-hooks';
import {
  LeverageInfoRow,
  LiquidityYieldInfo,
  NativeYieldPopup,
} from './components';
import { formatTokenType } from '@notional-finance/helpers';
import { TokenDefinition } from '@notional-finance/core-entities';
import { pointsMultiple } from '@notional-finance/util';

interface TradeActionSummaryProps {
  state: BaseTradeState;
  stakedNOTEApy?: number;
  liquidityYieldData?: APYData;
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
  const { tradeType, deposit, debt, vaultConfig, vaultAddress } = state;
  const isVault = !!vaultAddress;
  const { totalAPY, apySpread, leverageRatio, assetAPY } = useTotalAPY(
    state,
    priorVaultFactors
  );
  const currentNetworkStore = useCurrentNetworkStore();
  const nonLeveragedYields = currentNetworkStore.getAllNonLeveragedYields();

  // const totalArbPoints = useTotalArbPoints();
  // const currentSeason = useCurrentSeason();
  const messages = tradeType ? TransactionHeadings[tradeType] : undefined;
  const headerText =
    messages?.headerText || defineMessage({ defaultMessage: 'unknown ' });
  const isLeveraged =
    isLeveragedTrade(tradeType) || priorVaultFactors !== undefined;
  const collateral = state.collateral || priorVaultFactors?.vaultShare;
  const pointPrices = usePointPrices();

  // const lendBoosts = state?.collateral
  //   ? getArbBoosts(state?.collateral, false)
  //   : 0;
  // const borrowBoosts = state?.debt ? getArbBoosts(state?.debt, true) : 0;

  // const hasArbPoints =
  //   tradeType !== 'LeveragedNToken' && (lendBoosts > 0 || borrowBoosts > 0);
  // const boostData = lendBoosts || borrowBoosts;
  // const pointsAPY = getPointsAPY(
  //   boostData,
  //   totalArbPoints[currentSeason.db_name],
  //   currentSeason.totalArb,
  //   currentSeason.startDate,
  //   currentSeason.endDate
  // );

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

  const nonLeveragedYield = nonLeveragedYields.find(
    (y) => y.token.id === collateral?.id
  );
  const points = nonLeveragedYield?.apy.pointMultiples;

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
        <Box sx={{ display: 'flex' }}>
          {points && (
            <Box
              sx={{
                marginTop: theme.spacing(1),
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {Object.keys(points).map((k) => (
                <Box marginRight={theme.spacing(1)} display="flex">
                  <H4>
                    {`${pointsMultiple(points[k], leverageRatio).toFixed(
                      2
                    )}x ${k} Points:`}
                    &nbsp;
                  </H4>
                  {pointPrices && (
                    <H4 light>{`$${
                      pointPrices.find((p) => p.points.includes(k))?.price ||
                      '-'
                    }/point`}</H4>
                  )}
                </Box>
              ))}
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
        </Box>
        {/* {hasArbPoints ? (
          <Box
            sx={{
              marginTop: theme.spacing(1),
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Box marginRight={theme.spacing(1)} display="flex">
              <H4>{`${lendBoosts || borrowBoosts}x ARB Points: `}</H4>
              <Subtitle
                sx={{
                  color: theme.palette.typography.light,
                  marginLeft: theme.spacing(0.5),
                }}
              >
                {pointsAPY !== Infinity &&
                  `+${formatNumberAsPercent(pointsAPY, 2)} APY`}
              </Subtitle>
            </Box>
          </Box>
        ) : (
          ''
        )} */}
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
