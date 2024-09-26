import { Box, useTheme } from '@mui/material';
import { ArrowIcon, AlertIcon } from '@notional-finance/icons';
import IconButton from '@mui/material/IconButton';

export const ChevronCell = ({ row }): JSX.Element => {
  const theme = useTheme();
  const showRowWarning: boolean | undefined =
    row?.original?.actionRow?.showRowWarning;

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
      {!row.original.isTotalRow && (
        <IconButton
          aria-label="expand row"
          id="dropdown-arrow-button"
          size="small"
          sx={{
            paddingLeft: '0px',
            height: '40px',
            width: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            paddingRight: '0px',
          }}
        >
          <ArrowIcon
            className="dropdown-arrow"
            sx={{
              color: theme.palette.primary.light,
              transform: `rotate(${row.isExpanded ? '0' : '180'}deg)`,
              transition: 'transform .5s ease-in-out',
            }}
          />
          {showRowWarning && (
            <AlertIcon
              sx={{
                position: 'absolute',
                marginRight: `-${theme.spacing(4)}`,
                marginBottom: theme.spacing(2.5),
                fill: theme.palette['warning'].dark,
                height: theme.spacing(1.5),
                width: theme.spacing(1.5),
              }}
            />
          )}
        </IconButton>
      )}
    </Box>
  );
};

export default ChevronCell;
