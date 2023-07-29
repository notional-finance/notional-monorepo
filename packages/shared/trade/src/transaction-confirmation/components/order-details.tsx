import { useTheme, Box } from '@mui/material';
import { DataTable, TABLE_VARIANTS } from '@notional-finance/mui';
import { BaseTradeState } from '@notional-finance/notionable';
import { useOrderDetails } from '@notional-finance/notionable-hooks';
import { FormattedMessage } from 'react-intl';

export const OrderDetails = ({ state }: { state: BaseTradeState }) => {
  const theme = useTheme();
  const orderDetails = useOrderDetails(state);
  return (
    <Box sx={{ marginBottom: theme.spacing(6) }}>
      <DataTable
        tableVariant={TABLE_VARIANTS.MINI}
        tableTitle={<FormattedMessage defaultMessage={'Order Details'} />}
        data={orderDetails}
        columns={[
          {
            Header: <FormattedMessage defaultMessage={'Detail'} />,
            accessor: 'label',
            textAlign: 'left',
          },
          {
            Header: <FormattedMessage defaultMessage={'Value'} />,
            accessor: 'value',
            textAlign: 'right',
          },
        ]}
      />
    </Box>
  );
};
