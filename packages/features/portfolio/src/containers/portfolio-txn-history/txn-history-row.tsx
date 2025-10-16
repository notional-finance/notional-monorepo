import { Box, useTheme } from '@mui/material';
import { Row } from '@tanstack/react-table';
import { AccountTransactions } from '@notional-finance/core-entities';
import { Label, LabelValue } from '@notional-finance/mui';

export const TxnHistoryRow = ({ row }: { row: Row<AccountTransactions> }) => {
  const theme = useTheme();
  const { lineItems } = row.original;
  return (
    <Box
      sx={{
        background: theme.palette.background.default,
        padding: theme.spacing(0, 8),
        height: '100%',
      }}
    >
      {lineItems.map((lineItem, index) => (
        <Box
          key={index}
          sx={{
            display: 'grid',
            // We have 7 columns: 2 for the label, 5 for the properties
            gridTemplateColumns: '1.5fr repeat(5, minmax(0, 1fr))',
            gap: theme.spacing(2),
            paddingTop: theme.spacing(1),
            paddingBottom: theme.spacing(1),
            borderTop:
              index === 0
                ? 'none'
                : `1px solid ${theme.palette.common['light']}`,
          }}
        >
          <Box sx={{ alignSelf: 'center' }}>
            <LabelValue>{lineItem.lineItemLabel}</LabelValue>
          </Box>
          {lineItem.properties.map((property, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                minWidth: 0,
                alignItems: 'flex-end',
              }}
            >
              <Label uppercase>{property.key}</Label>
              <LabelValue>{property.value}</LabelValue>
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  );
};
