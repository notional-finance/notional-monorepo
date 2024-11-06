import { useState } from 'react';
import { useTheme, Box } from '@mui/material';
import {
  DataTable,
  TABLE_VARIANTS,
  MultiValueCell,
  Body,
} from '@notional-finance/mui';
import {
  useCurrentTradeContext,
  useOrderDetails,
} from '@notional-finance/notionable-hooks';
import { FormattedMessage } from 'react-intl';
import { observer } from 'mobx-react-lite';

export const OrderDetails = observer(() => {
  const theme = useTheme();
  const [showHiddenRows, setShowHiddenRows] = useState(false);
  const { orderDetails, filteredOrderDetails } = useOrderDetails();
  const trade = useCurrentTradeContext();
  const postTradeIncentives = trade?.getPostTradeIncentives();
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
            header: <FormattedMessage defaultMessage={'Detail'} />,
            accessorKey: 'label',
            textAlign: 'left',
          },
          {
            header: <FormattedMessage defaultMessage={'Value'} />,
            cell: MultiValueCell,
            accessorKey: 'value',
            textAlign: 'right',
          },
        ]}
      />
      {postTradeIncentives?.map((i) => (
        <Body
          sx={{
            display: 'inline-flex',
            marginTop: theme.spacing(2),
            marginLeft: theme.spacing(1),
            marginBottom: theme.spacing(6),
            padding: theme.spacing(0.5, 1.75),
            color: theme.palette.primary.light,
            float: 'right',
            borderRadius: theme.shape.borderRadius(),
            background: theme.palette.info.light,
          }}
        >
          <FormattedMessage
            defaultMessage={'+{i} Claimed'}
            values={{ i: i.toDisplayStringWithSymbol(3) }}
          />
        </Body>
      ))}
    </Box>
  );
});
