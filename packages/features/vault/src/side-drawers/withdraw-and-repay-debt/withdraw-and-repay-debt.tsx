import { VAULT_ACTIONS } from '@notional-finance/shared-config';
import { VaultSideDrawer } from '../components/vault-side-drawer';
import { SliderInput, SliderInputHandle } from '@notional-finance/mui';
import { WalletDepositInput } from '@notional-finance/trade';
import { useWithdrawAndRepayDebt } from './use-withdraw-and-repay-debt';
import { useParams } from 'react-router-dom';
import { messages } from '../messages';
import { VaultActionContext } from '../../vault-view/vault-action-provider';
import { RATE_PRECISION } from '@notional-finance/sdk/src/config/constants';
import { useCallback, useEffect, useRef, useContext } from 'react';

interface VaultParams {
  vaultAddress: string;
  sideDrawerKey?: VAULT_ACTIONS;
}

export const WithdrawAndRepayDebt = () => {
  const { vaultAddress } = useParams<VaultParams>();
  const inputRef = useRef<SliderInputHandle>(null);
  const { updateState } = useContext(VaultActionContext);
  const setInputAmount = useCallback(
    (input: number) => {
      inputRef.current?.setInputOverride(input);
    },
    [inputRef]
  );

  const {
    canSubmit,
    transactionData,
    sliderError,
    sliderInfo,
    maxLeverageRatio,
    targetLeverageRatio,
    primaryBorrowSymbol,
    updatedVaultAccount,
    updateWithdrawAndRepayDebtState,
  } = useWithdrawAndRepayDebt(vaultAddress);

  useEffect(() => {
    if (targetLeverageRatio) {
      setInputAmount(targetLeverageRatio / RATE_PRECISION);
    }
  }, [targetLeverageRatio, setInputAmount]);

  return (
    <VaultSideDrawer
      action={VAULT_ACTIONS.WITHDRAW_AND_REPAY_DEBT}
      canSubmit={canSubmit}
      transactionData={transactionData}
      vaultAddress={vaultAddress}
      updatedVaultAccount={updatedVaultAccount}
    >
      {primaryBorrowSymbol && (
        <WalletDepositInput
          availableTokens={[primaryBorrowSymbol]}
          selectedToken={primaryBorrowSymbol}
          onChange={({ inputAmount, hasError }) => {
            updateState({ depositAmount: inputAmount, hasError });
          }}
          inputLabel={
            messages[VAULT_ACTIONS.WITHDRAW_AND_REPAY_DEBT].inputLabel
          }
          errorMsgOverride={undefined}
        />
      )}

      <SliderInput
        ref={inputRef}
        min={0}
        max={maxLeverageRatio / RATE_PRECISION}
        onChangeCommitted={(newLeverageRatio) =>
          updateWithdrawAndRepayDebtState({
            targetLeverageRatio: Math.floor(newLeverageRatio * RATE_PRECISION),
          })
        }
        errorMsg={sliderError}
        infoMsg={sliderInfo}
        inputLabel={messages[VAULT_ACTIONS.WITHDRAW_AND_REPAY_DEBT].leverage}
      />
    </VaultSideDrawer>
  );
};
