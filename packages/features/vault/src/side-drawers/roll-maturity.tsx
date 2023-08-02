import { DepositInput, MaturitySelect } from '@notional-finance/trade';
import { useCurrencyInputRef } from '@notional-finance/mui';
import { VaultActionContext } from '../vault-view/vault-action-provider';
import { messages } from '../messages';
import { VaultLeverageSlider, VaultSideDrawer } from '../components';
import { useContext } from 'react';

export const RollMaturity = () => {
  const { currencyInputRef } = useCurrencyInputRef();
  const context = useContext(VaultActionContext);

  return (
    <VaultSideDrawer context={context}>
      <MaturitySelect
        context={context}
        category={'Debt'}
        inputLabel={messages['RollVaultPosition'].maturity}
      />
      <DepositInput
        ref={currencyInputRef}
        inputRef={currencyInputRef}
        context={context}
        inputLabel={messages['RollVaultPosition']['inputLabel']}
      />
      <VaultLeverageSlider
        context={context}
        inputLabel={messages['RollVaultPosition'].leverage}
      />
    </VaultSideDrawer>
  );
};
