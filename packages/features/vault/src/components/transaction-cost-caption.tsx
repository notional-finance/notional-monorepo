import { Box, useTheme } from '@mui/material';
import { CountUp, InfoTooltip } from '@notional-finance/mui';
import { FormattedMessage, MessageDescriptor } from 'react-intl';

interface TransactionCostCaptionProps {
  toolTipText: MessageDescriptor;
  transactionCost: number;
  suffix: string;
}

export const TransactionCostCaption = ({
  toolTipText,
  transactionCost,
  suffix,
}: TransactionCostCaptionProps) => {
  const theme = useTheme();
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <FormattedMessage defaultMessage="Transaction Costs: " />
      <InfoTooltip
        toolTipText={toolTipText}
        sx={{ fontSize: '14px', marginLeft: theme.spacing(0.5) }}
      />
      <Box sx={{ fontWeight: 'bold', marginLeft: theme.spacing(1) }}>
        <CountUp value={transactionCost} suffix={suffix} decimals={2} />
      </Box>
    </Box>
  );
};
