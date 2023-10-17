import { Box, useTheme } from '@mui/material';
import {
  TokenIcon,
  DoubleTokenIcon,
  LightningIcon,
} from '@notional-finance/icons';
import {
  TableCell,
  SmallTableCell,
  LargeTableCell,
} from '../../typography/typography';

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

export const MultiValueIconCell = (props): JSX.Element => {
  const theme = useTheme();
  const {
    cell: { value },
    row: { original },
    column,
  } = props;
  const FirstValue = column?.expandableTable ? LargeTableCell : TableCell;
  const SecondValue = column?.expandableTable ? TableCell : SmallTableCell;

  const values = original.multiValueCellData
    ? original.multiValueCellData[column.id]
    : value;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      {!original.isTotalRow &&
        (values.symbol && values.symbolBottom ? (
          <DoubleTokenIcon
            size="medium"
            symbolTop={values.symbol}
            symbolBottom={values.symbolBottom}
          />
        ) : (
          <TokenIcon symbol={values.symbol} size="medium" />
        ))}

      <Box sx={{ marginLeft: theme.spacing(1), marginRight: theme.spacing(1) }}>
        <FirstValue gutter="default" sx={{ marginBottom: '0px' }}>
          {values.label}
        </FirstValue>
        <SecondValue
          sx={{ marginBottom: '0px', color: theme.palette.typography.light }}
        >
          {values.caption || ''}
        </SecondValue>
      </Box>
      {values.symbol && values.symbolBottom ? <LightningIcon /> : null}
    </Box>
  );
};

export default MultiValueIconCell;
