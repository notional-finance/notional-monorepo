import { useContext } from 'react';
import { NOTEContext } from '..';
import { useTheme } from '@mui/material';
import { DepositInput, TransactionSidebar } from '@notional-finance/trade';
import { useCurrencyInputRef } from '@notional-finance/mui';

export const Stake = () => {
  const theme = useTheme();
  const context = useContext(NOTEContext);
  const ethInputRef = useCurrencyInputRef();
  const noteInputRef = useCurrencyInputRef();

  return (
    <TransactionSidebar
      context={context}
      showDrawer
      mobileTopMargin={theme.spacing(16)}
    >
      <DepositInput
        showScrollPopper
        ref={noteInputRef}
        inputRef={noteInputRef}
        context={context}
      />
      <DepositInput
        showScrollPopper
        ref={ethInputRef}
        inputRef={ethInputRef}
        context={context}
      />
    </TransactionSidebar>
  );
};
