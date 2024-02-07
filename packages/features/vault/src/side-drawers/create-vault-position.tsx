import { useContext } from 'react';
import { useCurrencyInputRef } from '@notional-finance/mui';
import { Box, styled, useTheme } from '@mui/material';
import { VaultActionContext } from '../vault';
import { VaultSideDrawer } from '../components/vault-side-drawer';
import { MobileVaultSummary, VaultLeverageSlider } from '../components';
import { useVaultActionErrors } from '../hooks';
import {
  DepositInput,
  CustomTerms,
  ManageTerms,
} from '@notional-finance/trade';
import { messages } from '../messages';
import { useVaultPosition } from '@notional-finance/notionable-hooks';

export const CreateVaultPosition = () => {
  const theme = useTheme();
  const context = useContext(VaultActionContext);
  const { currencyInputRef } = useCurrencyInputRef();
  const { inputErrorMsg } = useVaultActionErrors();
  const {
    updateState,
    state: {
      vaultAddress,
      selectedNetwork,
      collateral,
      debt,
      availableCollateralTokens,
      availableDebtTokens,
      isReady,
    },
  } = context;
  const vaultPosition = useVaultPosition(selectedNetwork, vaultAddress);

  if (
    !collateral &&
    !debt &&
    availableDebtTokens &&
    availableCollateralTokens &&
    isReady
  ) {
    const debtDefault = availableDebtTokens?.find((t) =>
      t.symbol.includes('open')
    );
    const collateralDefault = availableCollateralTokens?.find((t) =>
      t.symbol.includes('open')
    );
    updateState({ debt: debtDefault, collateral: collateralDefault });
  }

  return (
    <>
      <SummaryWrapper>
        <MobileVaultSummary />
      </SummaryWrapper>
      <Box
        sx={{
          marginTop: {
            xs: theme.spacing(22),
            sm: theme.spacing(22),
            md: '0px',
          },
        }}
      >
        <VaultSideDrawer context={context}>
          <DepositInput
            ref={currencyInputRef}
            inputRef={currencyInputRef}
            context={context}
            errorMsgOverride={inputErrorMsg}
            inputLabel={messages['CreateVaultPosition'].depositAmount}
            excludeSupplyCap
          />
          {vaultPosition ? (
            <ManageTerms
              context={context}
              isVault={true}
              linkString={`/vaults/${selectedNetwork}/${vaultAddress}/Manage`}
            />
          ) : (
            <CustomTerms
              context={context}
              hideToggle
              CustomLeverageSlider={VaultLeverageSlider}
            />
          )}
        </VaultSideDrawer>
      </Box>
    </>
  );
};

const SummaryWrapper = styled(Box)(
  ({ theme }) => `
  display: none;
  ${theme.breakpoints.down('sm')} {
    display: block;
    position: fixed;
    top: ${theme.spacing(8.75)};
    left: 0;
    min-width: 100vw;
    z-index: 1;
  }
`
);
