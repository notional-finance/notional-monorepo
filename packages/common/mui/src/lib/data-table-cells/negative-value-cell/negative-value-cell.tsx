import { useTheme } from '@mui/material';
import {
  TableCell,
  LargeTableCell,
  SmallTableCell,
} from '../../typography/typography';

// interface NegativeValueCellProps {
//   value: {
//     isNegative?: boolean;
//     displayValueGreen?: boolean;
//     displayValue: string;
//   };
//   column?: {
//     expandableTable?: boolean;
//     smallCell?: boolean;
//   };
// }

export const NegativeValueCell = ({ cell }): JSX.Element => {
  const theme = useTheme();
  const value = cell.getValue();
  const { column } = cell;
  const Cell = column?.columnDef.expandableTable
    ? LargeTableCell
    : column?.columnDef.smallCell
    ? SmallTableCell
    : TableCell;
  const color = value.isNegative
    ? theme.palette.error.main
    : value.displayValueGreen
    ? theme.palette.typography.accent
    : theme.palette.typography.main;

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
