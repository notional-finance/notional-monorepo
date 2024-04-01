import { useTheme } from '@mui/material';
import { TableCell } from '../../typography/typography';
import { NotionalTheme } from '@notional-finance/styles';
import { LaunchIcon } from '@notional-finance/icons';

export const TxnHashCell = ({ cell: { getValue, column } }): JSX.Element => {
  const value = getValue();
  const { hash, href } = value;
  const { showLinkIcon, textAlign } = column.columnDef;
  const theme = useTheme() as NotionalTheme;

  return (
    <TableCell
      href={href}
      sx={{
        cursor: 'pointer',
        color: theme.palette.typography.accent,
        display: 'flex',
        alignItems: 'center',
        justifyContent: textAlign || 'flex-end',
      }}
    >
      {hash && hash.length > 0 && (
        <div>
          {hash.slice(0, 6)}
          ...{hash.slice(hash.length - 4)}
        </div>
      )}

      {showLinkIcon ? (
        <LaunchIcon
          sx={{
            marginTop: '5px',
            marginLeft: theme.spacing(1),
          }}
        />
      ) : null}
    </TableCell>
  );
};

export default TxnHashCell;
