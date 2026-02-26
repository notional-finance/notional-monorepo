import { alpha, Box, Chip, TableCell, TableRow, useTheme } from '@mui/material';
import { FiatKeys } from '@notional-finance/core-entities';
import { TokenIcon } from '@notional-finance/icons';
import { Body, BodySecondary, H4 } from '@notional-finance/mui';
import { formatNumberAsPercentWithUndefined } from '@notional-finance/helpers';
import { useAllVaults } from '@notional-finance/notionable-hooks';
import { useNavigate } from 'react-router-dom';

interface VaultRowProps {
  vault: ReturnType<typeof useAllVaults>[number];
  baseCurrency: FiatKeys;
}

const STRATEGY_LABELS: Record<string, string> = {
  Staking: 'Staking',
  PendlePT: 'Pendle PT',
  CurveConvex2Token: 'Liquidity',
  SingleSidedLP: 'Liquidity',
};

export const VaultRow = ({ vault, baseCurrency }: VaultRowProps) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const strategyType =
    STRATEGY_LABELS[vault?.vaultConfig?.strategyClass] || 'Vault';
  const vaultFeatures = vault?.vaultConfig?.vaultFeatures || [];
  const depositSymbol = vault?.vaultConfig?.depositToken?.symbol?.toLowerCase();
  const selectedNetwork = String(
    vault?.vaultConfig?.network || 'mainnet'
  ).toLowerCase();
  const vaultAddress = vault?.vaultConfig?.vaultAddress?.toLowerCase();

  const liquidityText =
    vault?.liquidity
      ?.toFiat(baseCurrency)
      .toDisplayStringWithSymbol(2, true, false) || '-';

  const tvlText =
    vault?.tvl
      ?.toFiat(baseCurrency)
      .toDisplayStringWithSymbol(2, true, false) || '-';

  const onRowClick = () => {
    if (!vaultAddress) return;
    navigate(`/vault/${selectedNetwork}/${vaultAddress}`);
  };

  return (
    <TableRow
      onClick={onRowClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onRowClick();
        }
      }}
      tabIndex={0}
      role="link"
      sx={{
        height: theme.spacing(10.25),
        backgroundColor: theme.palette.common.white,
        cursor: 'pointer',
        transition: 'all .2s ease-in-out',
        '&:hover': {
          backgroundColor: alpha(theme.palette.primary.light, 0.15),
        },
        '& .MuiTableCell-root': {
          borderBottom: 'none',
          padding: theme.spacing(2, 1),
          verticalAlign: 'middle',
        },
        '& .MuiTableCell-root:first-of-type': {
          borderTopLeftRadius: theme.shape.borderRadius(),
          borderBottomLeftRadius: theme.shape.borderRadius(),
          paddingLeft: theme.spacing(3),
          width: '33%',
        },
        '& .MuiTableCell-root:last-of-type': {
          borderTopRightRadius: theme.shape.borderRadius(),
          borderBottomRightRadius: theme.shape.borderRadius(),
          paddingRight: theme.spacing(3),
        },
      }}
    >
      <TableCell>
        <Box
          sx={{ display: 'flex', alignItems: 'center', gap: theme.spacing(2) }}
        >
          <TokenIcon symbol={depositSymbol || 'unknown'} size="large" />
          <Box>
            <H4 gutter="none">{vault?.vaultConfig?.name || '-'}</H4>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing(1),
              }}
            >
              <BodySecondary
                gutter="none"
                sx={{
                  color: theme.palette.typography.light,
                }}
              >
                <img src={vault?.vaultConfig?.strategyIcon} />
                {strategyType}
              </BodySecondary>
              {vaultFeatures.slice(0, 2).map((feature) => (
                <Chip
                  key={feature}
                  label={feature}
                  size="small"
                  sx={{
                    height: '20px',
                    borderRadius: theme.spacing(2.5),
                    backgroundColor: 'rgba(38, 203, 207, 0.2)',
                    color: theme.palette.primary.light,
                    '& .MuiChip-label': {
                      padding: theme.spacing(0.5, 1.5),
                      fontSize: '12px',
                      fontWeight: 500,
                    },
                  }}
                />
              ))}
            </Box>
          </Box>
        </Box>
      </TableCell>
      <TableCell>
        <Box
          sx={{ display: 'flex', alignItems: 'center', gap: theme.spacing(1) }}
        >
          {vault?.vaultConfig?.vaultAssets?.map((asset) => (
            <TokenIcon symbol={asset.logoURL || 'unknown'} size="medium" />
          ))}
        </Box>
      </TableCell>
      <TableCell sx={{ textAlign: 'right' }}>
        <H4 gutter="none">{liquidityText}</H4>
        <Body
          gutter="none"
          sx={{
            color: theme.palette.typography.light,
          }}
        >
          {`${tvlText} TVL`}
        </Body>
      </TableCell>
      <TableCell sx={{ textAlign: 'right' }}>
        <Body
          gutter="none"
          sx={{
            color: theme.palette.typography.light,
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          {vault?.apy?.incentives?.length
            ? vault.apy.incentives.map((i) => i.symbol).join(', ')
            : '-'}
        </Body>
      </TableCell>
      <TableCell sx={{ textAlign: 'right' }}>
        <Body
          gutter="none"
          sx={{
            color: theme.palette.typography.light,
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          {vault?.apy?.pointMultiples
            ? Object.entries(vault.apy.pointMultiples)
                .map(([k, v]) => `${v}x ${k}`)
                .join(', ')
            : '-'}
        </Body>
      </TableCell>
      <TableCell sx={{ textAlign: 'right' }}>
        <H4 gutter="none">
          {formatNumberAsPercentWithUndefined(vault?.apy?.totalAPY, '-')}
        </H4>
      </TableCell>
    </TableRow>
  );
};
