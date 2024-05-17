import { useContext } from 'react';
import { NOTEContext } from '..';
import { useTheme } from '@mui/material';
import { TransactionSidebar } from '@notional-finance/trade';

export const CoolDown = () => {
  const theme = useTheme();
  const context = useContext(NOTEContext);

  return (
    <TransactionSidebar
      riskComponent={<div />}
      context={context}
      showDrawer
      mobileTopMargin={theme.spacing(16)}
    >
      {/* Add redemption window values */}
    </TransactionSidebar>
  );
};
