import { useContext } from 'react';
import { WalletDepositInput } from '@notional-finance/trade';
import { VAULT_ACTIONS } from '@notional-finance/shared-config';
import { VaultSideDrawer } from '../components/vault-side-drawer';
import { VaultActionContext } from '../../vault-view/vault-action-provider';
import { useDepositCollateral } from './use-deposit-collateral';
import { messages } from '../messages';

export const DepositCollateral = () => {
  const {
    updateState,
    state: {
      primaryBorrowSymbol,
      updatedVaultAccount,
      vaultAddress,
      buildTransactionCall,
    },
  } = useContext(VaultActionContext);
  const transactionData = useDepositCollateral();
  const canSubmit = buildTransactionCall ? true : false;
  const currentVaultAddress = vaultAddress || '';

  return (
    <VaultSideDrawer
      action={VAULT_ACTIONS.DEPOSIT_COLLATERAL}
      canSubmit={canSubmit}
      transactionData={transactionData}
      vaultAddress={currentVaultAddress}
      updatedVaultAccount={updatedVaultAccount}
    >
      {primaryBorrowSymbol && (
        <WalletDepositInput
          availableTokens={[primaryBorrowSymbol]}
          selectedToken={primaryBorrowSymbol}
          onChange={({ inputAmount, hasError }) => {
            updateState({
              depositAmount: inputAmount,
              hasError,
            });
          }}
          inputLabel={messages[VAULT_ACTIONS.DEPOSIT_COLLATERAL]['inputLabel']}
          errorMsgOverride={undefined}
        />
      )}
    </VaultSideDrawer>
  );
};
