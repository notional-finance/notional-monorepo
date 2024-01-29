import { VaultActionContext } from '../vault';
import { messages } from '../messages';
import { VaultLeverageSlider, VaultSideDrawer } from '../components';
import { useContext } from 'react';

export const AdjustLeverage = () => {
  const context = useContext(VaultActionContext);

  return (
    <VaultSideDrawer context={context}>
      <VaultLeverageSlider
        context={context}
        inputLabel={messages['AdjustVaultLeverage'].leverage}
      />
    </VaultSideDrawer>
  );
};
