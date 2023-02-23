import { WalletDepositInput } from '@notional-finance/trade';
import { VAULT_ACTIONS } from '@notional-finance/shared-config';
import { useParams } from 'react-router-dom';
import { VaultSideDrawer } from '../components/vault-side-drawer';
import { useDepositCollateral } from './use-deposit-collateral';
import { messages } from '../messages';

interface VaultParams {
  vaultAddress: string;
  sideDrawerKey?: VAULT_ACTIONS;
}

export const DepositCollateral = () => {
  const { vaultAddress } = useParams<VaultParams>();

  const {
    canSubmit,
    transactionData,
    depositError,
    targetLeverageRatio,
    primaryBorrowSymbol,
    updatedVaultAccount,
    updateDepositCollateralState,
  } = useDepositCollateral(vaultAddress);

  return (
    <VaultSideDrawer
      action={VAULT_ACTIONS.DEPOSIT_COLLATERAL}
      canSubmit={canSubmit}
      transactionData={transactionData}
      vaultAddress={vaultAddress}
      updatedVaultAccount={updatedVaultAccount}
    >
      {primaryBorrowSymbol && targetLeverageRatio && (
        <WalletDepositInput
          availableTokens={[primaryBorrowSymbol]}
          selectedToken={primaryBorrowSymbol}
          onChange={({ inputAmount, hasError }) => {
            updateDepositCollateralState({
              depositAmount: inputAmount,
              hasError,
            });
          }}
          inputLabel={messages[VAULT_ACTIONS.DEPOSIT_COLLATERAL]['inputLabel']}
          errorMsgOverride={depositError}
        />
      )}
    </VaultSideDrawer>
  );
};
