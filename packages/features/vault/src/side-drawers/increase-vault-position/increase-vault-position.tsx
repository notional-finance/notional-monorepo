import { useContext, useEffect } from 'react';
import { WalletDepositInput } from '@notional-finance/trade';
import { SliderInput, useSliderInputRef } from '@notional-finance/mui';
import { VAULT_ACTIONS } from '@notional-finance/shared-config';
import { VaultSideDrawer } from '../components/vault-side-drawer';
import { VaultActionContext } from '../../vault-view/vault-action-provider';
import { RATE_PRECISION } from '@notional-finance/sdk/src/config/constants';
import { useIncreaseVaultPosition } from './use-increase-vault-position';
import { messages } from '../../messages';
import { DebtAmountCaption, TransactionCostCaption } from '../../components';

export const IncreaseVaultPosition = () => {
  const {
    updateState,
    state: { primaryBorrowSymbol, maxLeverageRatio, leverageRatio },
  } = useContext(VaultActionContext);
  const { sliderInputRef, setSliderInput } = useSliderInputRef();
  useEffect(() => {
    if (leverageRatio) {
      setSliderInput(leverageRatio / RATE_PRECISION);
    }
  }, [leverageRatio, setSliderInput]);

  const transactionData = useIncreaseVaultPosition();
  const sliderError = undefined;
  const sliderInfo = undefined;

  return (
    <VaultSideDrawer transactionData={transactionData}>
      {primaryBorrowSymbol && (
        <WalletDepositInput
          availableTokens={[primaryBorrowSymbol]}
          selectedToken={primaryBorrowSymbol}
          onChange={({ inputAmount, hasError }) => {
            updateState({
              depositAmount: inputAmount,
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
        rightCaption={
          primaryBorrowSymbol ? (
            <DebtAmountCaption
              borrowAmount={cashBorrowed}
              suffix={primaryBorrowSymbol}
            />
          ) : undefined
        }
        bottomCaption={
          primaryBorrowSymbol ? (
            <TransactionCostCaption
              toolTipText={messages.summary.transactionCostToolTip}
              transactionCost={transactionCost}
              suffix={primaryBorrowSymbol}
            />
          ) : undefined
        }
      />
    </VaultSideDrawer>
  );
};
