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
import { isLeveragedTrade } from '@notional-finance/notionable';
import { TransactionHeadings } from '../transaction-sidebar/components/transaction-headings';
import { FormattedMessage, defineMessage } from 'react-intl';
import {
  useCurrentTradeContext,
  useVaultPoints,
  useVaultProperties,
  useVaultRewardTokens,
} from '@notional-finance/notionable-hooks';
import {
  LeverageInfoRow,
  LiquidityYieldInfo,
  NativeYieldPopup,
} from './components';
import {
  formatNumberAsPercent,
  formatTokenType,
} from '@notional-finance/helpers';
import { MultiTokenIcon } from '@notional-finance/icons';
import { observer } from 'mobx-react-lite';

interface TradeActionSummaryProps {
  stakedNOTEApy?: number;
  isLeveragedNToken?: boolean;
  children?: ReactNode | ReactNode[];
}

export const TradeActionSummary = observer(
  ({ stakedNOTEApy, isLeveragedNToken, children }: TradeActionSummaryProps) => {
    const theme = useTheme();
    const trade = useCurrentTradeContext();
    const tradeType = trade?.tradeType;
    const {
      deposit,
      debt: _debt,
      collateral: _collateral,
    } = trade?.selectedTokens || {};
    // Collateral and debt need to be swapped for leveraged ntoken trades
    const collateral = trade?.hasSwappedTokens() ? _debt : _collateral;
    const debt = trade?.hasSwappedTokens() ? _collateral : _debt;
    const vaultAddress = trade?.vaultAddress;
    const isVault = !!vaultAddress;
    const vaultConfig = useVaultProperties(vaultAddress);
    const apyFactors = trade?.getAPYFactors();

    const messages = tradeType ? TransactionHeadings[tradeType] : undefined;
    const headerText =
      messages?.headerText ||
      (isLeveragedNToken
        ? defineMessage({ defaultMessage: 'Manage Leveraged Liquidity' })
        : defineMessage({ defaultMessage: 'unknown' }));
    const isLeveraged = isLeveragedTrade(tradeType) || isVault;
    const vaultType = useVaultProperties(vaultAddress)?.vaultType;
    const points = useVaultPoints(vaultAddress);
    const rewardTokens = useVaultRewardTokens(vaultAddress);

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

    const { title } = isVault
      ? { title: 'Vault Shares' }
      : collateral
      ? formatTokenType(collateral)
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
              value={apyFactors?.totalAPY || stakedNOTEApy}
              title={apySuffix}
              valueSuffix="%"
              hasPoints={!!points}
              InfoComp={
                apyFactors?.totalAPY ? (
                  <NativeYieldPopup selectedToken={deposit?.symbol || ''} />
                ) : undefined
              }
            />
            {isVault && vaultType === 'SingleSidedLP_AutoReinvest' && (
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
                  {apyFactors?.organicAPY !== undefined
                    ? formatNumberAsPercent(apyFactors.organicAPY)
                    : '-'}
                </H4>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <H4 sx={{ marginRight: theme.spacing(0.5) }}>Reward APY: </H4>
                  {vaultType === 'SingleSidedLP_DirectClaim' &&
                    rewardTokens && (
                      <MultiTokenIcon
                        symbols={rewardTokens.map((t) => t.symbol)}
                        size="medium"
                        shiftSize={8}
                      />
                    )}
                  <H4 sx={{ marginLeft: theme.spacing(0.5) }}>
                    {apyFactors?.incentiveAPY !== undefined
                      ? formatNumberAsPercent(apyFactors.incentiveAPY)
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
            {isVault &&
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
          {apyFactors &&
            (collateral?.tokenType === 'nToken' ||
              debt?.tokenType === 'nToken') && (
              <LiquidityYieldInfo liquidityYieldData={apyFactors} />
            )}
          {isLeveraged && (
            <LeverageInfoRow
              assetSymbol={title}
              assetAPY={apyFactors?.assetAPY}
              apySpread={apyFactors?.apySpread}
              leverage={apyFactors?.leverageRatio}
            />
          )}
        </Box>
        {children}
      </TradeSummaryContainer>
    );
  }
);

export default TradeActionSummary;
