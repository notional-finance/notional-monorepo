import { useTheme } from '@mui/material';
import { TableCell } from '../../typography/typography';
import { NotionalTheme } from '@notional-finance/styles';
import { LaunchIcon } from '@notional-finance/icons';

export interface TxnHashCellProps {
  cell: {
    value: {
      hash: string;
      href: string;
    };
    column: { showLinkIcon?: boolean };
  };
}

export const TxnHashCell = ({
  cell: {
    value: { href, hash },
    column: { showLinkIcon },
  },
}: TxnHashCellProps): JSX.Element => {
  const theme = useTheme() as NotionalTheme;

  return (
    <TableCell
      href={href}
      sx={{
        color: theme.palette.typography.accent,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
      }}
    >
      {hash.slice(0, 6)}
      ...{hash.slice(hash.length - 4)}
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
