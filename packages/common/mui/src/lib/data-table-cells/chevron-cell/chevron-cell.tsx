import { Box, useTheme } from '@mui/material';
import { ArrowIcon } from '@notional-finance/icons';
import IconButton from '@mui/material/IconButton';

export const ChevronCell = ({ row }): JSX.Element => {
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
      <IconButton
        aria-label="expand row"
        size="small"
        sx={{
          paddingLeft: '0px',
          height: '30px',
          width: '30px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingRight: '0px',
        }}
      >
        {
          <ArrowIcon
            className="dropdown-arrow"
            sx={{
              color: theme.palette.primary.light,
              transform: `rotate(${row.isExpanded ? '0' : '180'}deg)`,
              transition: 'transform .5s ease-in-out',
            }}
          />
        }
      </IconButton>
    </Box>
  );
};

export default ChevronCell;
