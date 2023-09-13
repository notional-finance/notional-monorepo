import { useState } from 'react';
import { useTheme, Box } from '@mui/material';
import {
  ArrowIndicatorCell,
  DataTable,
  NegativeValueCell,
  TABLE_VARIANTS,
} from '@notional-finance/mui';
import { TradeState, VaultTradeState } from '@notional-finance/notionable';
import { usePortfolioComparison } from '@notional-finance/notionable-hooks';
import { FormattedMessage } from 'react-intl';

export const PortfolioCompare = ({
  state,
}: {
  state: TradeState | VaultTradeState;
}) => {
  const theme = useTheme();
  const [showHiddenRows, setShowHiddenRows] = useState(false);
  const { onlyCurrent, allTableData, filteredTableData } =
    usePortfolioComparison(state);
  const tableData = showHiddenRows ? allTableData : filteredTableData;

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
      smallCell: true,
      Cell: NegativeValueCell,
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
        showHiddenRows={showHiddenRows}
        setShowHiddenRows={
          allTableData.length > filteredTableData.length
            ? setShowHiddenRows
            : undefined
        }
        hiddenRowMessage={
          <FormattedMessage defaultMessage={'View Full Portfolio Holdings'} />
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
                    current: {
                      displayValue: current,
                      isNegative: current.startsWith('-'),
                    },
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
