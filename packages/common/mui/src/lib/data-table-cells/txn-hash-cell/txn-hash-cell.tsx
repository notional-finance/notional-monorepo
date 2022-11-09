import { useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import { TableCell } from '../../typography/typography';
import { NotionalTheme } from '@notional-finance/styles';
import outboundLinkIcon from '../../../assets/icons/icon-outbound-link.svg';

const LinkIcon = styled('img')``;

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
    <TableCell href={href}>
      {hash.slice(0, 6)}
      ...{hash.slice(hash.length - 4)}
      {showLinkIcon ? (
        <LinkIcon
          sx={{
            width: theme.spacing(2),
            marginLeft: theme.spacing(1),
          }}
          src={outboundLinkIcon}
          alt="outbound link"
        />
      ) : null}
    </TableCell>
  );
};

export default TxnHashCell;
