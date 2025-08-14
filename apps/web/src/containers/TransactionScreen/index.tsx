import { useTradeContext } from '@notional-finance/notionable-hooks';
import { TransactionScreen } from './transaction-screen';
import { Button, H5, useCurrencyInputRef } from '@notional-finance/mui';
import { DepositInput, LeverageSlider } from '@notional-finance/trade';
import { defineMessage } from 'react-intl';
import { Box, styled, useTheme } from '@mui/material';

export const VaultDefaultScreen = () => {
  // TODO: switch between deposit and manage screens based on the position
  return <VaultDepositScreen />;
};

export const VaultDepositScreen = () => {
  const { currencyInputRef } = useCurrencyInputRef();
  useTradeContext('CreateVaultPosition');

  return (
    <TransactionScreen
      inputs={[
        <DepositInput
          inputLabel={defineMessage({
            defaultMessage: 'Deposit',
          })}
          inputRef={currencyInputRef}
        />,
        <LeverageSlider
          inputLabel={defineMessage({
            defaultMessage: 'Leverage',
          })}
        />,
      ]}
    />
  );
};

export const VaultWithdrawScreen = () => {
  useTradeContext('WithdrawVault');
  // TODO: add withdraw input
  return <TransactionScreen actionPrefix="Withdraw" inputs={[]} />;
};

export const VaultAdjustLeverageScreen = () => {
  useTradeContext('AdjustVaultLeverage');
  // TODO: add adjust leverage input
  return (
    <TransactionScreen
      actionPrefix="Adjust Leverage"
      inputs={[
        <LeverageSlider
          inputLabel={defineMessage({ defaultMessage: 'Leverage' })}
        />,
      ]}
    />
  );
};

export const VaultManageScreen = () => {
  const theme = useTheme();

  // TODO: create a new manage trade context
  useTradeContext('CreateVaultPosition');
  return (
    <TransactionScreen
      actionPrefix="Manage"
      inputs={[
        <Box>
          <H5>Manage Actions</H5>
          <Box
            sx={{
              display: 'flex',
              gap: theme.spacing(1),
              flexDirection: 'row',
              width: '100%',
              justifyContent: 'space-around',
              marginTop: theme.spacing(1),
            }}
          >
            <ManageButton>Deposit</ManageButton>
            <ManageButton>Withdraw</ManageButton>
            <ManageButton>Adjust Leverage</ManageButton>
          </Box>
        </Box>,
      ]}
    />
  );
};

const ManageButton = styled(Button)(({ theme }) => ({
  flexGrow: 1,
  maxWidth: '33%',
  padding: theme.spacing(2, 0),
  margin: theme.spacing(0, 1),
  background: theme.palette.info.light,
  color: theme.palette.typography.main,
}));
