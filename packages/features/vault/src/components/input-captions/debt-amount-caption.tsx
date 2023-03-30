import { Box, useTheme } from '@mui/material';
import { CountUp } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';

interface DebtAmountCaptionProps {
  amount: number;
  suffix: string;
  repayDebt?: boolean;
}

export const DebtAmountCaption = ({
  amount,
  suffix,
  repayDebt,
}: DebtAmountCaptionProps) => {
  const theme = useTheme();
  return (
    <Box sx={{ display: 'flex' }}>
      <FormattedMessage
        defaultMessage={repayDebt ? 'Debt Repaid: ' : 'Borrow Amount: '}
      />
      <Box sx={{ fontWeight: 'bold', marginLeft: theme.spacing(1) }}>
        <CountUp value={amount} suffix={suffix} decimals={3} />
      </Box>
    </Box>
  );
};
