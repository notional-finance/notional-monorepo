import { messages } from '../messages';
import { VaultLeverageSlider, VaultSideDrawer } from '../components';
import { observer } from 'mobx-react-lite';
import { useCurrentTradeContext } from '@notional-finance/notionable-hooks';
import { useCallback, useState } from 'react';

export const AdjustLeverage = observer(() => {
  const trade = useCurrentTradeContext();
  const [hasTouched, setHasTouched] = useState(false);

  const onChange = useCallback(
    (leverageRatio: number) => {
      if (!hasTouched) setHasTouched(true);
      if (!isFinite(leverageRatio)) return;

      trade?.setLeverageRatio(leverageRatio);
    },
    [trade, hasTouched]
  );

  return (
    <VaultSideDrawer canSubmitOverride={hasTouched}>
      <VaultLeverageSlider
        inputLabel={messages['AdjustVaultLeverage'].leverage}
        onChange={onChange}
      />
    </VaultSideDrawer>
  );
});
