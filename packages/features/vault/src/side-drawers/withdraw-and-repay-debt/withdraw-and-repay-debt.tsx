import { VAULT_ACTIONS } from '@notional-finance/shared-config';
import { VaultSideDrawer } from '../components/vault-side-drawer';
import { SliderInput, useSliderInputRef } from '@notional-finance/mui';
import { useWithdrawAndRepayDebt } from './use-withdraw-and-repay-debt';
import { messages } from '../../messages';
import { VaultActionContext } from '../../vault-view/vault-action-provider';
import { RATE_PRECISION } from '@notional-finance/sdk/src/config/constants';
import { useEffect, useContext } from 'react';
import { DebtAmountCaption, TransactionCostCaption } from '../../components';

export const WithdrawAndRepayDebt = () => {
  const {
    updateState,
    state: { maxLeverageRatio, leverageRatio, primaryBorrowSymbol },
  } = useContext(VaultActionContext);
  const { sliderInputRef, setSliderInput } = useSliderInputRef();
  useEffect(() => {
    if (leverageRatio) {
      setSliderInput(leverageRatio / RATE_PRECISION);
    }
  }, [leverageRatio, setSliderInput]);

  const transactionData = useWithdrawAndRepayDebt();
  const sliderError = undefined;
  const sliderInfo = undefined;

  return (
    <VaultSideDrawer transactionData={transactionData}>
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
        rightCaption={
          primaryBorrowSymbol ? (
            <DebtAmountCaption
              repayDebt
              amount={cashBorrowed}
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
        inputLabel={messages[VAULT_ACTIONS.WITHDRAW_AND_REPAY_DEBT].leverage}
      />
    </VaultSideDrawer>
  );
};
