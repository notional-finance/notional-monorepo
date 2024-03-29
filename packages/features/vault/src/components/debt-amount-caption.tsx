import { Box, useTheme } from '@mui/material';
import { CountUp } from '@notional-finance/mui';
import { TypedBigNumber } from '@notional-finance/sdk';
import { defineMessage, FormattedMessage } from 'react-intl';

interface DebtAmountCaptionProps {
  amount?: TypedBigNumber;
  repayDebt?: boolean;
}

const DebtRepaid = defineMessage({ defaultMessage: 'Debt Repaid: ' });
const BorrowAmount = defineMessage({ defaultMessage: 'Borrow Amount: ' });

export const DebtAmountCaption = ({
  amount,
  repayDebt,
}: DebtAmountCaptionProps) => {
  const theme = useTheme();
  return (
    <Box sx={{ display: 'flex' }}>
      <FormattedMessage {...(repayDebt ? DebtRepaid : BorrowAmount)} />
      <Box sx={{ fontWeight: 'bold', marginLeft: theme.spacing(1) }}>
        {amount ? (
          <CountUp
            value={amount.abs().toFloat()}
            suffix={` ${amount.symbol}`}
            decimals={0}
          />
        ) : (
          '-'
        )}
      </Box>
    </Box>
  );
};
