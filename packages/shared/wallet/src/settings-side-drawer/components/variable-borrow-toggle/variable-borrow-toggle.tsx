import { Box } from '@mui/material';
import { ToggleSwitch } from '@notional-finance/mui';
import {
  useAccountReady,
  useWalletConnectedNetwork,
} from '@notional-finance/notionable-hooks';
import { useEnablePrimeBorrow } from '@notional-finance/trade';
import { useCallback } from 'react';

export const useVariableBorrowToggle = () => {
  const network = useWalletConnectedNetwork();
  const isAccountReady = useAccountReady(network);
  const { isPrimeBorrowAllowed, enablePrimeBorrow, disablePrimeBorrow } =
    useEnablePrimeBorrow(network);
  const isChecked = isAccountReady ? isPrimeBorrowAllowed : false;

  const variableBorrowToggle = useCallback(() => {
    // Only active when account is connected
    if (!isAccountReady) return;
    if (isPrimeBorrowAllowed) {
      disablePrimeBorrow();
    } else {
      enablePrimeBorrow();
    }
  }, [
    isAccountReady,
    isPrimeBorrowAllowed,
    enablePrimeBorrow,
    disablePrimeBorrow,
  ]);

  return { variableBorrowToggle, isChecked };
};

export const VariableBorrowToggle = () => {
  const { isChecked } = useVariableBorrowToggle();

  return (
    <Box
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <ToggleSwitch isChecked={isChecked || false} />
    </Box>
  );
};

export default VariableBorrowToggle;
