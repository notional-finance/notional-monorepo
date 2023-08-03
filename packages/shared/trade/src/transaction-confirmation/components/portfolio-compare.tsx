import { useTheme, Box } from '@mui/material';
import {
  ArrowIndicatorCell,
  DataTable,
  TABLE_VARIANTS,
} from '@notional-finance/mui';
import { BaseTradeState } from '@notional-finance/notionable';
import { usePortfolioComparison } from '@notional-finance/notionable-hooks';
import { FormattedMessage } from 'react-intl';

export const PortfolioCompare = ({ state }: { state: BaseTradeState }) => {
  const theme = useTheme();
  const { onlyCurrent, tableData } = usePortfolioComparison(state);

  const columns: any[] = [
    {
      Header: <FormattedMessage defaultMessage={'Asset'} />,
      accessor: 'label',
      textAlign: 'left',
    },
    {
      Header: <FormattedMessage defaultMessage={'Current'} />,
      accessor: 'current',
      textAlign: 'right',
    },
  ];

  if (!onlyCurrent) {
    columns.push({
      Header: <FormattedMessage defaultMessage={'Updated'} />,
      Cell: ArrowIndicatorCell,
      accessor: 'updated',
      textAlign: 'right',
    });
  }

  return (
    <Box sx={{ marginBottom: theme.spacing(6) }}>
      <DataTable
        tableVariant={TABLE_VARIANTS.MINI}
        tableTitle={<FormattedMessage defaultMessage={'Portfolio Holdings'} />}
        stateZeroMessage={
          <FormattedMessage defaultMessage={'Your portfolio is empty'} />
        }
        data={
          onlyCurrent
            ? tableData || []
            : (tableData || []).map(
                ({
                  label,
                  current,
                  updated,
                  changeType,
                  isUpdatedNegative,
                }) => {
                  return {
                    label,
                    current,
                    updated: {
                      value: updated,
                      arrowUp:
                        changeType === 'none'
                          ? null
                          : changeType === 'increase',
                      checkmark: changeType === 'cleared',
                      greenOnCheckmark: true,
                      greenOnArrowUp: true,
                      isNegative: isUpdatedNegative,
                    },
                  };
                }
              )
        }
        columns={columns}
      />
    </Box>
  );
};
