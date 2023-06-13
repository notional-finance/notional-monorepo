import { useContext } from 'react';
import { TokenApprovalView, WalletDepositInput } from '@notional-finance/trade';
import { VAULT_ACTIONS } from '@notional-finance/shared-config';
import { VaultSideDrawer } from '../components/vault-side-drawer';
import { VaultActionContext } from '../vault-view/vault-action-provider';
import { messages } from '../messages';
import { useCurrencyInputRef } from '@notional-finance/mui';

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
  const { currencyInputRef } = useCurrencyInputRef();

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
          ref={currencyInputRef}
          inputRef={currencyInputRef}
          availableTokens={[primaryBorrowSymbol]}
          selectedToken={primaryBorrowSymbol}
          onChange={({ hasError }) => {
            updateState({
              // depositAmount: inputAmount,
              hasError,
            });
          }}
          inputLabel={messages[VAULT_ACTIONS.DEPOSIT_COLLATERAL]['inputLabel']}
          errorMsgOverride={errorMsg}
        />
      )}
      <TokenApprovalView symbol={primaryBorrowSymbol} />
    </VaultSideDrawer>
  );
};
