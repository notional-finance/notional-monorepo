import { VAULT_ACTIONS } from '@notional-finance/shared-config';
import { VaultSideDrawer } from '../components/vault-side-drawer';
import { SliderInput, SliderInputHandle } from '@notional-finance/mui';
import { useWithdrawAndRepayDebt } from './use-withdraw-and-repay-debt';
import { messages } from '../messages';
import { VaultActionContext } from '../../vault-view/vault-action-provider';
import { RATE_PRECISION } from '@notional-finance/sdk/src/config/constants';
import { useCallback, useEffect, useRef, useContext } from 'react';

export const WithdrawAndRepayDebt = () => {
  const {
    updateState,
    state: { maxLeverageRatio, leverageRatio },
  } = useContext(VaultActionContext);
  const inputRef = useRef<SliderInputHandle>(null);
  const transactionData = useWithdrawAndRepayDebt();

  const sliderError = undefined;
  const sliderInfo = undefined;

  const setInputAmount = useCallback(
    (input: number) => {
      inputRef.current?.setInputOverride(input);
    },
    [inputRef]
  );

  useEffect(() => {
    if (leverageRatio) {
      setInputAmount(leverageRatio / RATE_PRECISION);
    }
  }, [leverageRatio, setInputAmount]);

  return (
    <VaultSideDrawer transactionData={transactionData}>
      <SliderInput
        ref={inputRef}
        min={0}
        max={maxLeverageRatio ? maxLeverageRatio / RATE_PRECISION : 0}
        onChangeCommitted={(newLeverageRatio) =>
          updateState({
            leverageRatio: Math.floor(newLeverageRatio * RATE_PRECISION),
          })
        }
        errorMsg={sliderError}
        infoMsg={sliderInfo}
        inputLabel={messages[VAULT_ACTIONS.WITHDRAW_AND_REPAY_DEBT].leverage}
      />
    </VaultSideDrawer>
  );
};
