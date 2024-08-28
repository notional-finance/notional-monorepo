import { Box } from '@mui/material';
import { ToggleSwitch } from '@notional-finance/mui';
import {
  useAccountReady,
  useWalletConnectedNetwork,
} from '@notional-finance/notionable-hooks';
import { useEnablePrimeBorrow } from '@notional-finance/trade';
import { observer } from 'mobx-react-lite';
import { useCallback } from 'react';

export const useVariableBorrowToggle = () => {
  const selectedChain = useWalletConnectedNetwork();
  const isAccountReady = useAccountReady(selectedChain);
  const { isPrimeBorrowAllowed, enablePrimeBorrow, disablePrimeBorrow } =
    useEnablePrimeBorrow(selectedChain);
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

const VariableBorrowToggle = () => {
  const { isChecked } = useVariableBorrowToggle();

  return (
    <Box
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <ToggleSwitch isChecked={isChecked || false} />
    </Box>
  );
};

export default observer(VariableBorrowToggle);
