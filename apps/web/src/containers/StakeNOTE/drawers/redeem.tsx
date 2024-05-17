import { useContext } from 'react';
import { NOTEContext } from '..';
import { useTheme } from '@mui/material';
import { DepositInput, TransactionSidebar } from '@notional-finance/trade';
import { useCurrencyInputRef } from '@notional-finance/mui';

export const Redeem = () => {
  const theme = useTheme();
  const context = useContext(NOTEContext);
  const { currencyInputRef: noteInputRef } = useCurrencyInputRef();

  return (
    <TransactionSidebar
      context={context}
      showDrawer
      mobileTopMargin={theme.spacing(16)}
      riskComponent={<div />}
    >
      <DepositInput
        isWithdraw
        onMaxValue={() => {
          console.log('TODO');
        }}
        ref={noteInputRef}
        inputRef={noteInputRef}
        context={context}
      />
      {/* Add caption for redeem window */}
      {/* Add cancel option  */}
    </TransactionSidebar>
  );
};
