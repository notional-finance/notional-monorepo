import { Box, useTheme } from '@mui/material';
import { CountUp } from '@notional-finance/mui';
import { TypedBigNumber } from '@notional-finance/sdk';
import { FormattedMessage } from 'react-intl';

interface DebtAmountCaptionProps {
  amount?: TypedBigNumber;
  repayDebt?: boolean;
}

export const DebtAmountCaption = ({
  amount,
  repayDebt,
}: DebtAmountCaptionProps) => {
  const theme = useTheme();
  return (
    <Box sx={{ display: 'flex' }}>
      <FormattedMessage
        defaultMessage={repayDebt ? 'Debt Repaid: ' : 'Borrow Amount: '}
      />
      <Box sx={{ fontWeight: 'bold', marginLeft: theme.spacing(1) }}>
        {amount ? (
          <CountUp
            value={amount.toFloat()}
            suffix={amount.symbol}
            decimals={3}
          />
        ) : (
          '-'
        )}
      </Box>
    </Box>
  );
};
