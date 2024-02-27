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
      symbolSize?: string;
      caption?: string;
      inlineIcons?: boolean;
    };
  };
  row: { original };
  column: { id; textAlign };
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

  // NOTE* Displays a token icon on the same line as the caption or label values. Based on the values.symbol and the captionSymbol.
  // Currently used in the Markets table
  const inlineIcons = values?.inlineIcons;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: column.textAlign,
      }}
    >
      {!original.isTotalRow && !inlineIcons ? (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {values?.symbol && values.symbolBottom && (
            <DoubleTokenIcon
              size="medium"
              symbolTop={values?.symbol}
              symbolBottom={values?.symbolBottom}
            />
          )}
          {values?.symbol && !values.symbolBottom && (
            <TokenIcon
              symbol={values?.symbol}
              size={values?.symbolSize || 'medium'}
            />
          )}
        </Box>
      ) : null}
      <Box sx={{ marginLeft: theme.spacing(1), marginRight: theme.spacing(1) }}>
        <FirstValue
          gutter="default"
          sx={{
            marginBottom: inlineIcons ? '4px' : '0px',
            display: 'flex',
            alignItems: 'flex-start',
          }}
        >
          {values?.symbol && values.symbolBottom && (
            <LightningIcon sx={{ height: '13px', marginLeft: '-6px' }} />
          )}
          {inlineIcons && (
            <TokenIcon
              symbol={values.symbol}
              size="small"
              style={{ marginRight: theme.spacing(0.5) }}
            />
          )}
          {values?.label}
        </FirstValue>
        <SecondValue
          sx={{
            marginBottom: '0px',
            color: theme.palette.typography.light,
            display: 'flex',
            alignItems: 'flex-start',
          }}
        >
          {inlineIcons && values?.captionSymbol && (
            <TokenIcon
              symbol={values.captionSymbol}
              size="small"
              style={{ marginRight: theme.spacing(0.5) }}
            />
          )}
          {values?.caption || ''}
        </SecondValue>
      </Box>
    </Box>
  );
};

export default MultiValueIconCell;
