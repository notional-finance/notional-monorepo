import { DepositInput } from '@notional-finance/trade';
import { useCurrencyInputRef } from '@notional-finance/mui';
import { VaultActionContext } from '../vault-view/vault-action-provider';
import { messages } from '../messages';
import { VaultLeverageSlider, VaultSideDrawer } from '../components';
import { useContext } from 'react';

export const IncreaseVaultPosition = () => {
  const { currencyInputRef } = useCurrencyInputRef();
  const context = useContext(VaultActionContext);

  return (
    <VaultSideDrawer context={context}>
      <DepositInput
        ref={currencyInputRef}
        inputRef={currencyInputRef}
        context={context}
        inputLabel={messages['IncreaseVaultPosition'].inputLabel}
      />
      <VaultLeverageSlider
        context={context}
        inputLabel={messages['IncreaseVaultPosition'].leverage}
      />
    </VaultSideDrawer>
  );
};
