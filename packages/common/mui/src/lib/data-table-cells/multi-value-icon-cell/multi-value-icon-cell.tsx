import { SmallTableCell, TableCell } from '../../typography/typography';
import { Box, useTheme } from '@mui/material';
import { TokenIcon } from '@notional-finance/icons';

export interface MultiValueIconCellProps {
  cell: {
    value: {
      symbol: string;
      label: string;
      caption?: string;
    };
  };
  row: { original };
  column: { id };
}

// NOTE*
// When the table column is sortable but needs to have cells with multiple values add multiValueCellData to the table data hook.
// multiValueCellData object must have the same key as accessor of cell that has multiple values.
// The value passed for that accessor in the table data must be the raw string or number value for the column to be sortable.

// Example:
// multiValueCellData: {
//   currency: {
//     symbol: underlying.symbol,
//     label: underlying.symbol,
//     caption: formatYieldCaption(data),
//   },
// },

export const MultiValueIconCell = ({
  cell: { value },
  row: { original },
  column: { id },
}: MultiValueIconCellProps): JSX.Element => {
  const theme = useTheme();
  const values = original.multiValueCellData
    ? original.multiValueCellData[id]
    : value;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <TokenIcon symbol={values.symbol || 'unknown'} size="medium" />
      <Box marginLeft={theme.spacing(1)}>
        <TableCell gutter="default">{values.label}</TableCell>
        <SmallTableCell>{values.caption || ''}</SmallTableCell>
      </Box>
    </Box>
  );
};

export default MultiValueIconCell;
