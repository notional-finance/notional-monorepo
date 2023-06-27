import { DepositInput } from '@notional-finance/trade';
import { VaultSideDrawer } from '../components/vault-side-drawer';
import { VaultActionContext } from '../vault-view/vault-action-provider';
import { messages } from '../messages';
import { useCurrencyInputRef } from '@notional-finance/mui';
import { useVaultActionErrors } from '../hooks';

export const DepositCollateral = () => {
  const { currencyInputRef } = useCurrencyInputRef();
  const { leverageRatioError } = useVaultActionErrors();

  return (
    <VaultSideDrawer>
      <DepositInput
        ref={currencyInputRef}
        inputRef={currencyInputRef}
        context={VaultActionContext}
        errorMsgOverride={leverageRatioError}
        inputLabel={messages['DepositVaultCollateral'].inputLabel}
      />
    </VaultSideDrawer>
  );
};
