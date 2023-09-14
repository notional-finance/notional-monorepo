import { Box, useTheme } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

export const ArrowChangeCell = ({ row }): JSX.Element => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        padding: `${theme.spacing(3)} 0px`,
        width: '100%',
        justifyContent: 'center',
      }}
    >
      <ArrowDropDownIcon
        sx={{
          color: theme.palette.primary.light,
          transform: `rotate(${row.isExpanded ? '0' : '180'}deg)`,
          transition: 'transform .5s ease-in-out',
        }}
      />
    </Box>
  );
};

export default ArrowChangeCell;
