import { useTheme } from '@mui/material';
import { formatTokenType } from '@notional-finance/helpers';
import { DisplayCell, MultiValueIconCell } from '@notional-finance/mui';
import {
  formatHealthFactorValues,
  useCurrentLiquidationPrices,
  useSelectedNetwork,
  useVaultHoldings,
} from '@notional-finance/notionable-hooks';
import { NotionalTheme } from '@notional-finance/styles';
import {
  PRIME_CASH_VAULT_MATURITY,
  formatMaturity,
} from '@notional-finance/util';
import { FormattedMessage } from 'react-intl';

const vaultRiskTableColumns = (theme: NotionalTheme) => [
  {
    header: (
      <FormattedMessage defaultMessage="Vault" description={'vault header'} />
    ),
    cell: MultiValueIconCell,
    accessorKey: 'vault',
    textAlign: 'left',
    expandableTable: true,
  },
  {
    header: (
      <FormattedMessage
        defaultMessage="Health Factor"
        description={'Health Factor header'}
      />
    ),
    cell: DisplayCell,
    displayFormatter: (val: number | null | undefined) => {
      const { value, textColor } = formatHealthFactorValues(val, theme);
      return <span style={{ color: textColor }}>{value}</span>;
    },
    accessorKey: 'healthFactor',
    textAlign: 'left',
    expandableTable: true,
  },
  {
    header: (
      <FormattedMessage
        defaultMessage="Exchange Rate"
        description={'column header'}
      />
    ),
    cell: MultiValueIconCell,
    expandableTable: true,
    accessorKey: 'exchangeRate',
    textAlign: 'left',
  },
  {
    header: (
      <FormattedMessage
        defaultMessage="Liquidation Price"
        description={'column header'}
      />
    ),
    cell: DisplayCell,
    expandableTable: true,
    accessorKey: 'liquidationPrice',
    textAlign: 'right',
  },
  {
    header: (
      <FormattedMessage
        defaultMessage="Current Price"
        description={'column header'}
      />
    ),
    cell: DisplayCell,
    expandableTable: true,
    accessorKey: 'currentPrice',
    textAlign: 'right',
  },
  // {
  //   header: (
  //     <FormattedMessage defaultMessage="24H %" description={'column header'} />
  //   ),
  //   cell: ArrowChangeCell,
  //   expandableTable: true,
  //   accessorKey: 'oneDayChange',
  //   textAlign: 'right',
  // },
  // {
  //   header: (
  //     <FormattedMessage defaultMessage="7D %" description={'column header'} />
  //   ),
  //   cell: ArrowChangeCell,
  //   expandableTable: true,
  //   accessorKey: 'sevenDayChange',
  //   textAlign: 'right',
  // },
];

export const useVaultRiskTable = () => {
  const theme = useTheme();
  const network = useSelectedNetwork();
  const vaults = useVaultHoldings(network);
  const { vaultLiquidation } = useCurrentLiquidationPrices(network);

  const tableData = vaultLiquidation
    .filter((l) => l.liquidationPrices.length > 0)
    .flatMap((l) => {
      const vaultHolding = vaults.find(
        (v) => v.vault.vaultAddress === l.vaultAddress
      );

      return vaultHolding
        ? l.liquidationPrices.map((p) => {
            return {
              vault: {
                symbol: formatTokenType(vaultHolding.denom).icon,
                label: vaultHolding.vault.vaultConfig.name,
                caption:
                  vaultHolding.vault.maturity === PRIME_CASH_VAULT_MATURITY
                    ? 'Open Term'
                    : `Maturity: ${formatMaturity(
                        vaultHolding.vault.maturity
                      )}`,
              },
              healthFactor: vaultHolding.vault.healthFactor(),
              ...p,
            };
          })
        : [];
    });

  return {
    riskTableData: tableData,
    riskTableColumns: vaultRiskTableColumns(theme),
    initialRiskState: {
      clickDisabled: true,
    },
  };
};
