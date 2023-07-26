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
import {
  useBalanceStatements,
  useVaultRiskProfiles,
} from '@notional-finance/notionable-hooks';
import { PRIME_CASH_VAULT_MATURITY } from '@notional-finance/util';
import { VaultAccountRiskProfile } from '@notional-finance/risk-engine';
import { TokenBalance } from '@notional-finance/core-entities';

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
  const balanceStatements = useBalanceStatements();

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
          defaultMessage="Profits"
          description={'profits header'}
        />
      ),
      Cell: MultiValueCell,
      accessor: 'profit',
      textAlign: 'right',
    },
    {
      Header: (
        <FormattedMessage defaultMessage="APY" description={'Debts header'} />
      ),
      accessor: 'totalAPY',
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

    const debtPnL = balanceStatements.find(
      (b) => b.token.id === v.vaultDebt.tokenId
    );
    const assetPnL = balanceStatements?.find(
      (b) => b.token.id === v.vaultShareDefinition.id
    );
    const profit = (
      assetPnL?.totalProfitAndLoss ||
      TokenBalance.zero(v.denom(v.defaultSymbol))
    ).sub(
      debtPnL?.totalProfitAndLoss || TokenBalance.zero(v.denom(v.defaultSymbol))
    );
    // TODO: need to fill out the APY calculation
    const totalAPY = 0;
    const strategyAPY = 0;
    const borrowAPY =
      debtPnL?.impliedFixedRate !== undefined
        ? formatNumberAsPercent(debtPnL.impliedFixedRate)
        : // TODO: if this is variable then show the current prime cash borrow rate
          0;

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
      profit: formatCryptoWithFiat(profit),
      totalAPY: formatNumberAsPercent(totalAPY),
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
      // TODO: these values are inside the accordion
      strategyAPY: {
        displayValue: formatNumberAsPercent(strategyAPY, 3),
        isNegative: strategyAPY && strategyAPY < 0,
      },
      borrowAPY: {
        displayValue: formatNumberAsPercent(borrowAPY, 3),
      },
      leverageRatio: formatLeverageRatio(v.leverageRatio() || 0),
    };
  });

  return { vaultHoldingsColumns, vaultHoldingsData };
};
