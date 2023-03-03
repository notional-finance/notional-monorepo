import { useContext } from 'react';
import { VAULT_ACTIONS } from '@notional-finance/shared-config';
import { VaultSideDrawer } from '../components/vault-side-drawer';
import { Maturities } from '@notional-finance/mui';
import { messages } from '../../messages';
import { VaultActionContext } from '../../vault-view/vault-action-provider';
import { RATE_PRECISION } from '@notional-finance/sdk/src/config/constants';

export const RollMaturity = () => {
  const {
    updateState,
    state: { selectedMarketKey, borrowMarketData },
  } = useContext(VaultActionContext);

  // const inputRef = useRef<SliderInputHandle>(null);
  // const setInputAmount = useCallback(
  //   (input: number) => {
  //     inputRef.current?.setInputOverride(input);
  //   },
  //   [inputRef]
  // );

  // const {
  //   canSubmit,
  //   transactionData,
  //   sideDrawerInfo,
  //   sliderError,
  //   sliderInfo,
  //   maxLeverageRatio,
  //   targetLeverageRatio,
  //   updatedVaultAccount,
  //   updateDeleverageVaultState,
  // } = useDeleverageVault(vaultAddress, action);

  // useEffect(() => {
  //   if (targetLeverageRatio) {
  //     setInputAmount(targetLeverageRatio / RATE_PRECISION);
  //   }
  // }, [targetLeverageRatio, setInputAmount]);

  return (
    <VaultSideDrawer transactionData={undefined}>
      <Maturities
        maturityData={borrowMarketData || []}
        onSelect={(marketKey: string | null) => {
          updateState({ selectedMarketKey: marketKey || '' });
        }}
        currentMarketKey={selectedMarketKey || ''}
        inputLabel={messages[VAULT_ACTIONS.ROLL_POSITION].maturity}
      />
      {/* <SliderInput
        ref={inputRef}
        min={0}
        max={maxLeverageRatio / RATE_PRECISION}
        onChangeCommitted={(newLeverageRatio) =>
          updateDeleverageVaultState({
            targetLeverageRatio: Math.floor(newLeverageRatio * RATE_PRECISION),
          })
        }
        errorMsg={sliderError}
        infoMsg={sliderInfo}
        inputLabel={messages[VAULT_ACTIONS.ROLL_POSITION]['inputLabel']}
      /> */}
    </VaultSideDrawer>
  );
};
