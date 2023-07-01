import { Theme, useTheme } from '@mui/material';
import {
  DataTableColumn,
  MultiValueCell,
  MultiValueIconCell,
  SliderCell,
} from '@notional-finance/mui';
import {
  formatCryptoWithFiat,
  formatLeverageRatio,
  formatMaturity,
  formatNumberAsPercent,
} from '@notional-finance/helpers';
import { FormattedMessage } from 'react-intl';
import { useVaultRiskProfiles } from '@notional-finance/notionable-hooks';
import { PRIME_CASH_VAULT_MATURITY } from '@notional-finance/util';
import { VaultAccountRiskProfile } from '@notional-finance/risk-engine';

export function getVaultLeveragePercentage(
  v: VaultAccountRiskProfile,
  theme: Theme
) {
  const maxLeverageRatio = v.maxLeverageRatio;
  const leverageRatio = v.leverageRatio();
  const leveragePercentage = leverageRatio
    ? (leverageRatio * 100) / maxLeverageRatio
    : null;
  let trackColor: string | undefined;

  if (leveragePercentage) {
    trackColor =
      leveragePercentage > 90
        ? theme.palette.error.main
        : leveragePercentage > 70
        ? theme.palette.warning.main
        : undefined;
  }

  return { maxLeverageRatio, leverageRatio, leveragePercentage, trackColor };
}

export const useVaultHoldingsTable = () => {
  const vaults = useVaultRiskProfiles();
  const theme = useTheme();

  const vaultHoldingsColumns: DataTableColumn[] = [
    {
      Header: (
        <FormattedMessage defaultMessage="Vault" description={'vault header'} />
      ),
      Cell: MultiValueIconCell,
      accessor: 'strategy',
      textAlign: 'left',
    },
    {
      Header: (
        <FormattedMessage
          defaultMessage="Net Worth"
          description={'Net Worth header'}
        />
      ),
      Cell: MultiValueCell,
      accessor: 'netWorth',
      textAlign: 'right',
    },
    {
      Header: (
        <FormattedMessage
          defaultMessage="Earnings"
          description={'earnings header'}
        />
      ),
      Cell: MultiValueCell,
      accessor: 'earnings',
      textAlign: 'right',
    },
    {
      Header: (
        <FormattedMessage defaultMessage="APY" description={'Debts header'} />
      ),
      accessor: 'apy',
      textAlign: 'right',
    },
    {
      Header: (
        <FormattedMessage
          defaultMessage="Leverage Ratio"
          description={'currency header'}
        />
      ),
      Cell: SliderCell,
      accessor: 'leveragePercentage',
      textAlign: 'right',
    },
  ];

  const vaultHoldingsData = vaults.map((v) => {
    const config = v.vaultConfig;
    const { leveragePercentage, leverageRatio, maxLeverageRatio, trackColor } =
      getVaultLeveragePercentage(v, theme);

    return {
      strategy: {
        symbol: v.defaultSymbol,
        label: config.name,
        caption:
          v.maturity === PRIME_CASH_VAULT_MATURITY
            ? 'Open Term'
            : `Maturity: ${formatMaturity(v.maturity)}`,
      },
      netWorth: formatCryptoWithFiat(v.netWorth()),
      // TODO: fill these out
      earnings: formatCryptoWithFiat(v.netWorth()),
      apy: formatNumberAsPercent(0),
      leveragePercentage: leveragePercentage
        ? {
            value: leveragePercentage,
            captionLeft: formatLeverageRatio(leverageRatio || 0, 1),
            captionRight: `Max: ${formatLeverageRatio(
              maxLeverageRatio || 0,
              1
            )}`,
            trackColor,
          }
        : undefined,
    };
  });

  return { vaultHoldingsColumns, vaultHoldingsData };
};
