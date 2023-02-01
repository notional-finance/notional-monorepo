import {
  TradePropertiesGrid,
  WalletDepositInput,
} from '@notional-finance/trade';
import { VAULT_ACTIONS } from '@notional-finance/shared-config';
import { useParams } from 'react-router-dom';
import { VaultSideDrawer } from '../components/vault-side-drawer';
import { useDeleverageVault } from './use-deposit-collateral';
import { Box } from '@mui/material';
import { messages } from '../messages';
import { RATE_PRECISION } from '@notional-finance/sdk/src/config/constants';

interface VaultParams {
  vaultAddress: string;
  sideDrawerKey?: VAULT_ACTIONS;
}

export const DepositCollateral = () => {
  const { vaultAddress, sideDrawerKey } = useParams<VaultParams>();
  const action = sideDrawerKey || VAULT_ACTIONS.DEPOSIT_COLLATERAL;

  const {
    canSubmit,
    transactionData,
    sideDrawerInfo,
    depositError,
    targetLeverageRatio,
    primaryBorrowSymbol,
    updatedVaultAccount,
    updateDeleverageVaultState,
  } = useDeleverageVault(vaultAddress, action);

  return (
    <VaultSideDrawer
      action={action}
      canSubmit={canSubmit}
      transactionData={transactionData}
      vaultAddress={vaultAddress}
      updatedVaultAccount={updatedVaultAccount}
    >
      {primaryBorrowSymbol && targetLeverageRatio && (
        <Box>
          <WalletDepositInput
            availableTokens={[primaryBorrowSymbol]}
            selectedToken={primaryBorrowSymbol}
            onChange={({ inputAmount, hasError }) => {
              updateDeleverageVaultState({
                depositAmount: inputAmount,
                hasError,
              });
            }}
            inputLabel={
              messages[VAULT_ACTIONS.DELEVERAGE_VAULT_DEPOSIT]['inputLabel']
            }
            errorMsgOverride={depositError}
          />
        </Box>
      )}
      <TradePropertiesGrid showBackground data={sideDrawerInfo} />
    </VaultSideDrawer>
  );
};
