import { TableCell } from '../../typography/typography';
import { Box } from '@mui/material';
import { TokenIcon } from '@notional-finance/icons';

export interface IconCellProps {
  cell: {
    value?: string;
  };
}

export const IconCell = ({ getValue }): JSX.Element => {
  const value = getValue();

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      {value?.toLocaleLowerCase() !== 'total' && (
        <TokenIcon symbol={value || 'unknown'} size="medium" />
      )}
      <TableCell
        style={{
          marginLeft: value?.toLocaleLowerCase() !== 'total' ? '10px' : '',
          lineHeight: 'normal',
          fontWeight: 600,
        }}
      >
        {value}
      </TableCell>
    </Box>
  );
};

export default IconCell;
