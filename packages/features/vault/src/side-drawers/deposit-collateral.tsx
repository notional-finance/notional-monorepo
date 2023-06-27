import { useContext } from 'react';
import { DepositInput } from '@notional-finance/trade';
import { VaultSideDrawer } from '../components/vault-side-drawer';
import { VaultActionContext } from '../vault-view/vault-action-provider';
import { messages } from '../messages';
import { useCurrencyInputRef } from '@notional-finance/mui';
import { useVaultProperties } from '@notional-finance/notionable-hooks';

export const DepositCollateral = () => {
  const {
    state: { postAccountRisk, vaultAddress },
  } = useContext(VaultActionContext);
  const { currencyInputRef } = useCurrencyInputRef();
  const { minLeverageRatio } = useVaultProperties(vaultAddress);

  // TODO: move this into vault action errors...
  const errorMsg =
    minLeverageRatio !== 0 &&
    !!postAccountRisk &&
    postAccountRisk.leverageRatio !== null &&
    postAccountRisk.leverageRatio < minLeverageRatio
      ? messages['DepositVaultCollateral']['belowMinLeverageError']
      : undefined;

  return (
    <VaultSideDrawer>
      <DepositInput
        ref={currencyInputRef}
        inputRef={currencyInputRef}
        context={VaultActionContext}
        errorMsgOverride={errorMsg}
        inputLabel={messages['DepositVaultCollateral'].inputLabel}
      />
    </VaultSideDrawer>
  );
};
