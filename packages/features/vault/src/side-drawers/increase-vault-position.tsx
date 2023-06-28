import { DepositInput } from '@notional-finance/trade';
import { useCurrencyInputRef } from '@notional-finance/mui';
import { VaultActionContext } from '../vault-view/vault-action-provider';
import { messages } from '../messages';
import { LeverageSlider, VaultSideDrawer } from '../components';

export const IncreaseVaultPosition = () => {
  const { currencyInputRef } = useCurrencyInputRef();

  return (
    <VaultSideDrawer>
      <DepositInput
        ref={currencyInputRef}
        inputRef={currencyInputRef}
        context={VaultActionContext}
        inputLabel={messages['IncreaseVaultPosition'].inputLabel}
      />
      <LeverageSlider inputLabel={messages['IncreaseVaultPosition'].leverage} />
    </VaultSideDrawer>
  );
};
