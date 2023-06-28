import { useSliderInputRef } from '@notional-finance/mui';
import { useVaultProperties } from '@notional-finance/notionable-hooks';
import { useContext, useEffect } from 'react';
import { VaultActionContext } from '../vault-view/vault-action-provider';

export function useDefaultLeverageRatio() {
  const { sliderInputRef, setSliderInput } = useSliderInputRef();
  const {
    updateState,
    state: { vaultAddress, riskFactorLimit },
  } = useContext(VaultActionContext);
  const { defaultLeverageRatio, maxLeverageRatio } = useVaultProperties(vaultAddress);

  // Sets the initial default leverage ratio
  useEffect(() => {
    if (!riskFactorLimit) {
      updateState({
        riskFactorLimit: {
          riskFactor: 'leverageRatio',
          limit: defaultLeverageRatio,
        },
      });
      setSliderInput(defaultLeverageRatio);
    }
  }, [riskFactorLimit, defaultLeverageRatio, setSliderInput, updateState]);

  return { sliderInputRef, maxLeverageRatio };
}
