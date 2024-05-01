import { useState } from 'react';
import { useTheme, Box } from '@mui/material';
import { CopyIcon } from '@notional-finance/icons';
import {
  ArrowIndicatorCell,
  DataTable,
  LinkText,
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
      header: <FormattedMessage defaultMessage={'Asset'} />,
      accessorKey: 'label',
      textAlign: 'left',
    },
    {
      header: <FormattedMessage defaultMessage={'Current'} />,
      accessorKey: 'current',
      textAlign: 'right',
      smallcell: true,
      cell: NegativeValueCell,
    },
  ];

  if (!onlyCurrent) {
    columns.push({
      header: <FormattedMessage defaultMessage={'Updated'} />,
      cell: ArrowIndicatorCell,
      accessorKey: 'updated',
      textAlign: 'right',
    });
  }

  const handleCopy = () => {
    if (state.populatedTransaction === undefined) return;
    const { gasLimit, value, data, from, to } = state.populatedTransaction;
    const result = {
      data,
      from,
      to,
      gasLimit: gasLimit?.toString(),
      value: value?.toString(),
    };
    navigator.clipboard.writeText(JSON.stringify(result));
  };

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
                ({ label, current, updated, changeType }) => {
                  return {
                    label,
                    current: {
                      displayValue: current,
                      isNegative: false,
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
                      isNegative: false,
                    },
                  };
                }
              )
        }
        columns={columns}
      />
      <LinkText
        sx={{
          textAlign: 'right',
          marginTop: theme.spacing(2),
          cursor: 'pointer',
        }}
        onClick={handleCopy}
      >
        <FormattedMessage defaultMessage={'Copy Transaction Details'} />
        <CopyIcon
          fill={theme.palette.typography.accent}
          sx={{
            marginLeft: theme.spacing(0.5),
            height: '1rem',
          }}
        />
      </LinkText>
    </Box>
  );
};
