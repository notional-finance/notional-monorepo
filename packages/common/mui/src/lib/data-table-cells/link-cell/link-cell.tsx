import { useTheme } from '@mui/material';
import { TableCell } from '../../typography/typography';
import { FormattedMessage } from 'react-intl';
import { NotionalTheme } from '@notional-finance/styles';

export const LinkCell = (props): JSX.Element => {
  const theme = useTheme() as NotionalTheme;
  const { getValue } = props.cell;
  const to = getValue();

  return (
    <TableCell
      sx={{
        color: theme.palette.typography.accent,
        cursor: 'pointer',
        textDecoration: 'underline',
      }}
      to={to}
    >
      <FormattedMessage defaultMessage={'View'} />
    </TableCell>
  );
};

export default LinkCell;
