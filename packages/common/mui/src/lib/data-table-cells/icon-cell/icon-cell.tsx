import { TableCell } from '../../typography/typography';
import { Box } from '@mui/material';
import { TokenIcon } from '@notional-finance/icons';

export interface IconCellProps {
  cell: {
    value?: string;
  };
}

export const IconCell = ({ cell: { value } }: IconCellProps): JSX.Element => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <TokenIcon symbol={value || 'unknown'} size="medium" />
      <TableCell style={{ marginLeft: '10px', lineHeight: 'normal' }}>{value}</TableCell>
    </Box>
  );
};

export default IconCell;
