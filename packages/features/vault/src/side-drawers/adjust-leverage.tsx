import { messages } from '../messages';
import { VaultLeverageSlider, VaultSideDrawer } from '../components';
import { observer } from 'mobx-react-lite';

export const AdjustLeverage = observer(() => {
  return (
    <VaultSideDrawer>
      <VaultLeverageSlider
        inputLabel={messages['AdjustVaultLeverage'].leverage}
      />
    </VaultSideDrawer>
  );
});
