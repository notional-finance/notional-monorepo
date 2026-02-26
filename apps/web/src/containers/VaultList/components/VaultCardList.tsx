import { Box, Divider, Paper, useTheme } from '@mui/material';
import { FiatKeys } from '@notional-finance/core-entities';
import { TokenIcon } from '@notional-finance/icons';
import { Body, BodySecondary, H4 } from '@notional-finance/mui';
import { formatNumberAsPercentWithUndefined } from '@notional-finance/helpers';
import { useAllVaults, useAppStore } from '@notional-finance/notionable-hooks';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';

interface VaultCardListProps {
  selectedDepositToken: 'USDC' | 'WETH' | null;
}

const STRATEGY_LABELS: Record<string, string> = {
  Staking: 'Staking',
  PendlePT: 'Pendle PT',
  CurveConvex2Token: 'Liquidity',
  SingleSidedLP: 'Liquidity',
};

interface VaultCardProps {
  vault: ReturnType<typeof useAllVaults>[number];
  baseCurrency: FiatKeys;
}

const VaultCard = ({ vault, baseCurrency }: VaultCardProps) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const strategyType =
    STRATEGY_LABELS[vault?.vaultConfig?.strategyClass] || 'Vault';
  const depositSymbol = vault?.vaultConfig?.depositToken?.symbol?.toLowerCase();
  const selectedNetwork = String(
    vault?.vaultConfig?.network || 'mainnet'
  ).toLowerCase();
  const vaultAddress = vault?.vaultConfig?.vaultAddress?.toLowerCase();

  const liquidityText =
    vault?.liquidity
      ?.toFiat(baseCurrency)
      .toDisplayStringWithSymbol(2, true, false) || '-';

  const rewardsText = vault?.apy?.incentives?.length
    ? vault.apy.incentives.map((i) => i.symbol).join(', ')
    : null;

  const pointsText = vault?.apy?.pointMultiples
    ? Object.entries(vault.apy.pointMultiples)
        .map(([k, v]) => `${v}x ${k}`)
        .join(', ')
    : null;

  const onCardClick = () => {
    if (!vaultAddress) return;
    navigate(`/vault/${selectedNetwork}/${vaultAddress}`);
  };

  return (
    <Paper
      onClick={onCardClick}
      sx={{
        borderRadius: theme.shape.borderRadius(),
        backgroundColor: theme.palette.common.white,
        padding: theme.spacing(2),
        boxShadow: 'none',
        cursor: 'pointer',
        transition: 'background-color .2s ease-in-out',
        '&:hover': {
          backgroundColor: theme.palette.action.hover,
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: theme.spacing(2),
        }}
      >
        <Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing(1.5),
            }}
          >
            <TokenIcon symbol={depositSymbol || 'unknown'} size="medium" />
            <Box>
              <H4 gutter="none" sx={{ marginBottom: theme.spacing(0.5) }}>
                {vault?.vaultConfig?.name || '-'}
              </H4>
              <BodySecondary
                gutter="none"
                sx={{
                  color: theme.palette.typography.light,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: theme.spacing(0.5),
                }}
              >
                <img src={vault?.vaultConfig?.strategyIcon} alt="" />
                {strategyType}
              </BodySecondary>
            </Box>
          </Box>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <BodySecondary
            gutter="none"
            sx={{ color: theme.palette.typography.light }}
          >
            MAX APY
          </BodySecondary>
          <H4 gutter="none">
            {formatNumberAsPercentWithUndefined(vault?.apy?.totalAPY, '-')}
          </H4>
        </Box>
      </Box>

      <Divider sx={{ margin: theme.spacing(1.5, 0) }} />

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: theme.spacing(2),
        }}
      >
        <BodySecondary
          gutter="none"
          sx={{ color: theme.palette.typography.light }}
        >
          Available Liquidity
        </BodySecondary>
        <H4 gutter="none" sx={{ textAlign: 'right' }}>
          {liquidityText}
        </H4>
      </Box>

      {pointsText && (
        <Box sx={{ marginTop: theme.spacing(1.5) }}>
          <BodySecondary
            gutter="none"
            sx={{ color: theme.palette.typography.light }}
          >
            Points
          </BodySecondary>
          <Body gutter="none">{pointsText}</Body>
        </Box>
      )}

      {rewardsText && (
        <Box sx={{ marginTop: theme.spacing(1.5) }}>
          <BodySecondary
            gutter="none"
            sx={{ color: theme.palette.typography.light }}
          >
            Rewards
          </BodySecondary>
          <Body gutter="none">{rewardsText}</Body>
        </Box>
      )}
    </Paper>
  );
};

export const VaultCardList = observer(
  ({ selectedDepositToken }: VaultCardListProps) => {
    const theme = useTheme();
    const vaults = useAllVaults();
    const { baseCurrency } = useAppStore();

    const filteredVaults = vaults.filter((vault) => {
      if (!vault.vaultConfig.isVisible) return false;
      if (!selectedDepositToken) return true;

      const depositSymbol =
        vault.vaultConfig.depositToken?.symbol?.toUpperCase();
      return depositSymbol === selectedDepositToken;
    });

    if (filteredVaults.length === 0) {
      return (
        <Paper
          sx={{
            borderRadius: theme.shape.borderRadius(),
            backgroundColor: theme.palette.common.white,
            padding: theme.spacing(2),
            boxShadow: 'none',
          }}
        >
          <H4 gutter="none">No Vaults Available</H4>
        </Paper>
      );
    }

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        {filteredVaults.map((vault, index) => (
          <Box key={vault.vaultConfig.vaultAddress}>
            <VaultCard vault={vault} baseCurrency={baseCurrency} />
            {index < filteredVaults.length - 1 && (
              <Divider
                sx={{
                  margin: theme.spacing(1, 0),
                  borderColor: theme.palette.divider,
                }}
              />
            )}
          </Box>
        ))}
      </Box>
    );
  }
);
