import { useContext } from 'react';
import { useCurrencyInputRef } from '@notional-finance/mui';
import { Box, useTheme } from '@mui/material';
import { VaultActionContext } from '../vault';
import { VaultSideDrawer } from '../components/vault-side-drawer';
import { VaultLeverageSlider } from '../components';
import { useVaultActionErrors } from '../hooks';
import {
  DepositInput,
  CustomTerms,
  ManageTerms,
} from '@notional-finance/trade';
import { messages } from '../messages';
import { useVaultPosition } from '@notional-finance/notionable-hooks';
import { PRIME_CASH_VAULT_MATURITY } from '@notional-finance/util';

export const CreateVaultPosition = () => {
  const theme = useTheme();
  const context = useContext(VaultActionContext);
  const { currencyInputRef } = useCurrencyInputRef();
  const { inputErrorMsg } = useVaultActionErrors();
  const {
    state: { vaultAddress, selectedNetwork },
  } = context;
  const vaultPosition = useVaultPosition(selectedNetwork, vaultAddress);

  return (
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
            borrowType={
              vaultPosition.vaultDebt.maturity ===
              PRIME_CASH_VAULT_MATURITY
                ? 'Variable'
                : 'Fixed'
            }
            leverageRatio={vaultPosition.leverageRatio}
            linkString={`/vaults/${selectedNetwork}/${vaultAddress}/Manage`}
          />
        ) : (
          <CustomTerms
            context={context}
            CustomLeverageSlider={VaultLeverageSlider}
          />
        )}
      </VaultSideDrawer>
    </Box>
  );
};
