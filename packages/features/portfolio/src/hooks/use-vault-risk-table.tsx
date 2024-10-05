import { useTheme } from '@mui/material';
import { formatTokenType } from '@notional-finance/helpers';
import {
  ArrowChangeCell,
  DisplayCell,
  MultiValueIconCell,
} from '@notional-finance/mui';
import {
  formatHealthFactorValues,
  useCurrentLiquidationPrices,
  useSelectedNetwork,
  useVaultHoldings,
} from '@notional-finance/notionable-hooks';
import {
  PRIME_CASH_VAULT_MATURITY,
  formatMaturity,
} from '@notional-finance/util';
import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';

export const useVaultRiskTable = () => {
  const theme = useTheme();
  const network = useSelectedNetwork();
  const vaults = useVaultHoldings(network);
  const { vaultLiquidation } = useCurrentLiquidationPrices(network);

  const tableData = vaultLiquidation
    .filter((data) => data.liquidationPrices.length > 0)
    .map((data) => {
      const riskData = vaultLiquidation.find(
        (x) => x.vaultAddress === data.vault.vaultAddress
      );
      return {
        vault: {
          symbol: formatTokenType(data.denom).icon,
          label: data.vault.vaultConfig.name,
          caption:
            data.vault.maturity === PRIME_CASH_VAULT_MATURITY
              ? 'Open Term'
              : `Maturity: ${formatMaturity(data.vault.maturity)}`,
        },
        healthFactor: data.vault.healthFactor(),
        // TODO: this will change...
        ...riskData?.liquidationPrices[0],
        exchangeRate: `Vault Shares / ${formatTokenType(data.denom).title}`,
      };
    });

  const vaultRiskTableColumns = useMemo(
    () => [
      {
        header: (
          <FormattedMessage
            defaultMessage="Vault"
            description={'vault header'}
          />
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
        displayFormatter: (val) => {
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
        cell: DisplayCell,
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
      {
        header: (
          <FormattedMessage
            defaultMessage="24H %"
            description={'column header'}
          />
        ),
        cell: ArrowChangeCell,
        expandableTable: true,
        accessorKey: 'oneDayChange',
        textAlign: 'right',
      },
      {
        header: (
          <FormattedMessage
            defaultMessage="7D %"
            description={'column header'}
          />
        ),
        cell: ArrowChangeCell,
        expandableTable: true,
        accessorKey: 'sevenDayChange',
        textAlign: 'right',
      },
    ],
    []
  );

  return {
    riskTableData: tableData,
    riskTableColumns: vaultRiskTableColumns,
    initialRiskState: {
      clickDisabled: true,
    },
  };
};
