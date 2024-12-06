import { messages } from '../messages';
import { VaultLeverageSlider, VaultSideDrawer } from '../components';

export const AdjustLeverage = () => {
  return (
    <VaultSideDrawer>
      <VaultLeverageSlider
        inputLabel={messages['AdjustVaultLeverage'].leverage}
      />
    </VaultSideDrawer>
  );
};
