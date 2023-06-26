import { Box, useTheme } from '@mui/material';
import { TokenBalance } from '@notional-finance/core-entities';
import { CountUp, InfoTooltip } from '@notional-finance/mui';
import { FormattedMessage, MessageDescriptor } from 'react-intl';

interface TransactionCostCaptionProps {
  toolTipText: MessageDescriptor;
  transactionCosts?: TokenBalance;
}

export const TransactionCostCaption = ({
  toolTipText,
  transactionCosts,
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
        {transactionCosts ? (
          <CountUp
            value={transactionCosts.toFloat()}
            suffix={` ${transactionCosts.symbol}`}
            decimals={2}
          />
        ) : (
          '-'
        )}
      </Box>
    </Box>
  );
};
