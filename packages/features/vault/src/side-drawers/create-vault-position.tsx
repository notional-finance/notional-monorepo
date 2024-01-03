import { useContext } from 'react';
import { useCurrencyInputRef } from '@notional-finance/mui';
import { Box, styled, useTheme } from '@mui/material';
import { VaultActionContext } from '../vault';
import { useVaultRiskProfiles } from '@notional-finance/notionable-hooks';
import { VaultSideDrawer } from '../components/vault-side-drawer';
import {
  MobileVaultSummary,
  CustomTerms,
  DefaultTerms,
  ManageTerms,
} from '../components';
import { useVaultActionErrors } from '../hooks';
import { DepositInput } from '@notional-finance/trade';
import { messages } from '../messages';

export const CreateVaultPosition = () => {
  const theme = useTheme();
  const context = useContext(VaultActionContext);
  const { currencyInputRef } = useCurrencyInputRef();
  const accountVaults = useVaultRiskProfiles();
  const { inputErrorMsg } = useVaultActionErrors();
  const {
    state: { vaultAddress, customizeLeverage },
  } = context;

  const hasVaultPosition = accountVaults.find(
    (p) => p.vaultAddress === vaultAddress
  );

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
          />
          {hasVaultPosition ? (
            <ManageTerms />
          ) : customizeLeverage ? (
            <CustomTerms />
          ) : (
            <DefaultTerms />
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
