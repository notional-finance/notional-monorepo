import { useTheme } from '@mui/material';
import { TableCell, LargeTableCell } from '../../typography/typography';

export const NegativeValueCell = ({ cell }): JSX.Element => {
  const theme = useTheme();
  const { value, column } = cell;
  const Cell = column?.expandableTable ? LargeTableCell : TableCell;
  const color = value.isNegative
    ? theme.palette.error.main
    : value.displayValueGreen
    ? theme.palette.typography.accent
    : '';
  return (
    <Cell
      sx={{
        color: color,
      }}
    >
      {value.displayValueGreen && !value?.isNegative && '+'}
      {value.displayValue}
    </Cell>
  );
};

export default NegativeValueCell;
