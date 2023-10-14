import { DepositInput } from '@notional-finance/trade';
import { VaultSideDrawer } from '../components/vault-side-drawer';
import { VaultActionContext } from '../vault';
import { messages } from '../messages';
import { useCurrencyInputRef } from '@notional-finance/mui';
import { useVaultActionErrors } from '../hooks';
import { useContext } from 'react';

export const DepositCollateral = () => {
  const { currencyInputRef } = useCurrencyInputRef();
  const { leverageRatioError } = useVaultActionErrors();
  const context = useContext(VaultActionContext);

  return (
    <VaultSideDrawer context={context}>
      <DepositInput
        ref={currencyInputRef}
        inputRef={currencyInputRef}
        context={context}
        errorMsgOverride={leverageRatioError}
        inputLabel={messages['DepositVaultCollateral'].inputLabel}
      />
    </VaultSideDrawer>
  );
};
