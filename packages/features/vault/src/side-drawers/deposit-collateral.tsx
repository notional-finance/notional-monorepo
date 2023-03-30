import { useContext } from 'react';
import { WalletDepositInput } from '@notional-finance/trade';
import { VAULT_ACTIONS } from '@notional-finance/shared-config';
import { VaultSideDrawer } from '../components/vault-side-drawer';
import { VaultActionContext } from '../vault-view/vault-action-provider';
import { messages } from '../messages';

export const DepositCollateral = () => {
  const {
    updateState,
    state: {
      primaryBorrowSymbol,
      updatedVaultAccount,
      minLeverageRatio,
      baseVault,
    },
  } = useContext(VaultActionContext);

  const errorMsg =
    minLeverageRatio &&
    updatedVaultAccount &&
    baseVault &&
    baseVault.getLeverageRatio(updatedVaultAccount) < minLeverageRatio
      ? messages[VAULT_ACTIONS.DEPOSIT_COLLATERAL]['belowMinLeverageError']
      : undefined;

  return (
    <VaultSideDrawer>
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
          errorMsgOverride={errorMsg}
        />
      )}
    </VaultSideDrawer>
  );
};
