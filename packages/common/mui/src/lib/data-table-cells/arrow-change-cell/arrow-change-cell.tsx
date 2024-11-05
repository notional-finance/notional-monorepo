import { Box, useTheme } from '@mui/material';
import { colors } from '@notional-finance/styles';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

export const ArrowChangeCell = ({ cell }): JSX.Element => {
  const theme = useTheme();
  const { getValue, column } = cell;
  const value: string | undefined = getValue();

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: column.columnDef.textAlign,
        alignItems: 'center',
        width: '100%',
        fontSize: column.columnDef?.expandableTable ? '16px' : '',
        color: value?.includes('-') ? colors.red : theme.palette.primary.light,
      }}
    >
      <ArrowDropDownIcon
        sx={{
          color: value?.includes('-')
            ? colors.red
            : theme.palette.primary.light,
          transform: value?.includes('-') ? '' : `rotate(180deg)`,
          transition: 'transform .5s ease-in-out',
        }}
      />
      <Box>{value}</Box>
    </Box>
  );
};

export default ArrowChangeCell;
