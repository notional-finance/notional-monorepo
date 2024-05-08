import { Box, useTheme } from '@mui/material';
import { formatTokenType } from '@notional-finance/helpers';
import { PointsIcon } from '@notional-finance/icons';
import {
  DataTableColumn,
  IconCell,
  MultiValueIconCell,
} from '@notional-finance/mui';
import {
  usePortfolioHoldings,
  useVaultHoldings,
} from '@notional-finance/notionable-hooks';
import { colors } from '@notional-finance/styles';
import {
  Network,
  PRIME_CASH_VAULT_MATURITY,
  formatMaturity,
} from '@notional-finance/util';
import { FormattedMessage } from 'react-intl';

export const useMyBreakdownTable = () => {
  const theme = useTheme();
  const portfolioHoldings = usePortfolioHoldings(Network.arbitrum);
  const vaultHoldings = useVaultHoldings(Network.arbitrum);

  const AccentCell = ({ cell }) => {
    const { getValue } = cell;
    const value = getValue();
    return <Box sx={{ color: colors.neonTurquoise }}>{value}</Box>;
  };

  const tableColumns: DataTableColumn[] = [
    {
      header: <FormattedMessage defaultMessage="Asset" />,
      cell: MultiValueIconCell,
      accessorKey: 'asset',
      textAlign: 'left',
      expandableTable: true,
      width: theme.spacing(15.875),
    },
    {
      header: (
        <FormattedMessage defaultMessage="Boost" description={'Boost header'} />
      ),
      cell: IconCell,
      showCustomIcon: true,
      accessorKey: 'boost',
      textAlign: 'right',
      width: theme.spacing(15.875),
    },
    {
      header: (
        <FormattedMessage
          defaultMessage="Points Per Day"
          description={'Points Per Day header'}
        />
      ),
      accessorKey: 'pointsPerDay',
      textAlign: 'right',
      width: theme.spacing(15.875),
    },
    {
      header: (
        <FormattedMessage
          defaultMessage="Total Points"
          description={'Total Points header'}
        />
      ),
      cell: AccentCell,
      accessorKey: 'totalPoints',
      textAlign: 'right',
      width: theme.spacing(15.875),
    },
  ];

  const vaultTableData = vaultHoldings.map(({ vault: v, denom }) => {
    const config = v.vaultConfig;

    return {
      asset: {
        symbol: formatTokenType(denom).icon,
        label: config.name,
        caption:
          v.maturity === PRIME_CASH_VAULT_MATURITY
            ? 'Open Term'
            : `Maturity: ${formatMaturity(v.maturity)}`,
      },
      boost: '6x',
      pointsPerDay: '1,230',
      totalPoints: '10,500',
      iconCellData: {
        icon: PointsIcon,
      },
    };
  });

  const portfolioTableData = portfolioHoldings.map(({ balance: b }) => {
    const isDebt = b.isNegative();
    const { icon, formattedTitle, titleWithMaturity } = formatTokenType(
      b.token,
      isDebt
    );

    return {
      asset: {
        symbol: icon,
        symbolBottom: '',
        label: formattedTitle,
        caption: titleWithMaturity,
      },
      boost: '6x',
      pointsPerDay: '1,230',
      totalPoints: '10,500',
      iconCellData: {
        icon: PointsIcon,
      },
    };
  });

  const tableData = [...vaultTableData, ...portfolioTableData];

  return { tableColumns, tableData };
};
