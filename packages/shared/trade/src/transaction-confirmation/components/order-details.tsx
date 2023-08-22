import { useState } from 'react';
import { useTheme, Box } from '@mui/material';
import {
  DataTable,
  TABLE_VARIANTS,
  MultiValueCell,
} from '@notional-finance/mui';
import { BaseTradeState } from '@notional-finance/notionable';
import { useOrderDetails } from '@notional-finance/notionable-hooks';
import { FormattedMessage } from 'react-intl';

export const OrderDetails = ({ state }: { state: BaseTradeState }) => {
  const theme = useTheme();
  const [showHiddenRows, setShowHiddenRows] = useState(false);
  const { orderDetails, filteredOrderDetails } = useOrderDetails(state);
  const tableData = showHiddenRows ? orderDetails : filteredOrderDetails;

  return (
    <Box sx={{ marginBottom: theme.spacing(6) }}>
      <DataTable
        tableVariant={TABLE_VARIANTS.MINI}
        tableTitle={<FormattedMessage defaultMessage={'Order Details'} />}
        data={tableData}
        showHiddenRows={showHiddenRows}
        setShowHiddenRows={setShowHiddenRows}
        hiddenRowMessage={
          <FormattedMessage defaultMessage={'View Full Order Details'} />
        }
        columns={[
          {
            Header: <FormattedMessage defaultMessage={'Detail'} />,
            accessor: 'label',
            textAlign: 'left',
          },
          {
            Header: <FormattedMessage defaultMessage={'Value'} />,
            Cell: MultiValueCell,
            accessor: 'value',
            textAlign: 'right',
          },
        ]}
      />
    </Box>
  );
};
