import { useContext, useEffect } from 'react';
import { TokenApprovalView, WalletDepositInput } from '@notional-finance/trade';
import {
  SliderInput,
  useCurrencyInputRef,
  useSliderInputRef,
} from '@notional-finance/mui';
import { VAULT_ACTIONS } from '@notional-finance/shared-config';
import { VaultSideDrawer } from '../components/vault-side-drawer';
import { VaultActionContext } from '../vault-view/vault-action-provider';
import { RATE_PRECISION } from '@notional-finance/sdk/src/config/constants';
import { messages } from '../messages';
import { DebtAmountCaption, TransactionCostCaption } from '../components';

export const IncreaseVaultPosition = () => {
  const {
    updateState,
    state: {
      primaryBorrowSymbol,
      maxLeverageRatio,
      leverageRatio,
      transactionCosts,
      cashBorrowed,
    },
  } = useContext(VaultActionContext);
  const { sliderInputRef, setSliderInput } = useSliderInputRef();
  const { currencyInputRef } = useCurrencyInputRef();
  useEffect(() => {
    if (leverageRatio) {
      setSliderInput(leverageRatio / RATE_PRECISION);
    }
  }, [leverageRatio, setSliderInput]);

  const sliderError = undefined;
  const sliderInfo = undefined;

  return (
    <VaultSideDrawer>
      {primaryBorrowSymbol && (
        <WalletDepositInput
          ref={currencyInputRef}
          inputRef={currencyInputRef}
          availableTokens={[primaryBorrowSymbol]}
          selectedToken={primaryBorrowSymbol}
          onChange={({ inputAmount: _inputAmount, hasError }) => {
            throw Error('Unimplemented');
            updateState({
              depositAmount: undefined,
              hasError,
            });
          }}
          inputLabel={messages[VAULT_ACTIONS.INCREASE_POSITION]['inputLabel']}
          errorMsgOverride={undefined}
        />
      )}
      <SliderInput
        ref={sliderInputRef}
        min={0}
        max={maxLeverageRatio ? maxLeverageRatio / RATE_PRECISION : 0}
        onChangeCommitted={(newLeverageRatio) =>
          updateState({
            leverageRatio: Math.floor(newLeverageRatio * RATE_PRECISION),
          })
        }
        errorMsg={sliderError}
        infoMsg={sliderInfo}
        inputLabel={messages[VAULT_ACTIONS.INCREASE_POSITION].leverage}
        rightCaption={<DebtAmountCaption amount={cashBorrowed} />}
        bottomCaption={
          <TransactionCostCaption
            toolTipText={messages.summary.transactionCostToolTip}
            transactionCosts={transactionCosts}
          />
        }
      />
      <TokenApprovalView symbol={primaryBorrowSymbol} />
    </VaultSideDrawer>
  );
};
