import { useContext } from 'react';
import { NOTEContext } from '..';
import { useTheme } from '@mui/material';
import { DepositInput, TransactionSidebar } from '@notional-finance/trade';
import { useCurrencyInputRef } from '@notional-finance/mui';
import { defineMessage } from 'react-intl';
import { TokenBalance } from '@notional-finance/core-entities';

export const Redeem = () => {
  const theme = useTheme();
  const context = useContext(NOTEContext);
  const {
    state: { deposit },
  } = context;
  const { currencyInputRef: sNOTEInputRef } = useCurrencyInputRef();

  return (
    <TransactionSidebar
      context={context}
      showDrawer
      // No approvals required for sNOTE redeem
      requiredApprovalAmount={deposit ? TokenBalance.zero(deposit) : undefined}
      mobileTopMargin={theme.spacing(16)}
      riskComponent={<div />}
    >
      <DepositInput
        inputLabel={defineMessage({
          defaultMessage: 'Enter amount of sNOTE to redeem',
        })}
        excludeSupplyCap
        ref={sNOTEInputRef}
        inputRef={sNOTEInputRef}
        context={context}
      />
      {/* Add caption for redeem window */}
      {/* Add cancel option  */}
    </TransactionSidebar>
  );
};
