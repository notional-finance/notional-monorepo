import { DepositInput, MaturitySelect } from '@notional-finance/trade';
import { useCurrencyInputRef } from '@notional-finance/mui';
import { VaultActionContext } from '../vault-view/vault-action-provider';
import { messages } from '../messages';
import { LeverageSlider, VaultSideDrawer } from '../components';

export const RollMaturity = () => {
  const { currencyInputRef } = useCurrencyInputRef();

  return (
    <VaultSideDrawer>
      <MaturitySelect
        context={VaultActionContext}
        category={'Debt'}
        inputLabel={messages['RollVaultPosition'].maturity}
      />
      <DepositInput
        ref={currencyInputRef}
        inputRef={currencyInputRef}
        context={VaultActionContext}
        inputLabel={messages['RollVaultPosition']['inputLabel']}
      />
      <LeverageSlider inputLabel={messages['RollVaultPosition'].leverage} />
    </VaultSideDrawer>
  );
};
