import { useTheme } from '@mui/material';
import { TableCell } from '../../typography/typography';
import { FormattedMessage } from 'react-intl';
import { NotionalTheme } from '@notional-finance/styles';

export const LinkCell = (): JSX.Element => {
  const theme = useTheme() as NotionalTheme;

  return (
    <TableCell
      sx={{
        color: theme.palette.typography.accent,
        textDecoration: 'underline',
      }}
    >
      <FormattedMessage defaultMessage={'View'} />
    </TableCell>
  );
};

export default LinkCell;
