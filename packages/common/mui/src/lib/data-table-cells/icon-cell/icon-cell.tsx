import { TableCell } from '../../typography/typography';
import { Box, useTheme } from '@mui/material';
import { TokenIcon } from '@notional-finance/icons';

// export interface IconCellProps {
//   cell: {
//     value?: string;
//   };
// }

export const IconCell = (props): JSX.Element => {
  const theme = useTheme();
  const {
    row: { original },
    column,
    getValue,
  } = props.cell;
  const showCustomIcon = column.columnDef?.showCustomIcon;
  const CustomIcon = original.iconCellData?.icon;
  const value = getValue();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: column.columnDef?.textAlign,
      }}
    >
      {value !== '-' &&
        value?.toLocaleLowerCase() !== 'total' &&
        !showCustomIcon && (
          <TokenIcon symbol={value || 'unknown'} size="medium" />
        )}
      {value !== '-' &&
        value?.toLocaleLowerCase() !== 'total' &&
        showCustomIcon && (
          <CustomIcon
            sx={{ height: theme.spacing(2), width: theme.spacing(2) }}
          />
        )}
      <TableCell
        style={{
          marginLeft:
            value?.toLocaleLowerCase() !== 'total' && !showCustomIcon
              ? theme.spacing(1.25)
              : theme.spacing(0.5),
          lineHeight: 'normal',
          fontWeight: 600,
        }}
      >
        {value}
      </TableCell>
    </Box>
  );
};

export default IconCell;
