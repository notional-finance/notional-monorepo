import { useRef } from 'react';
import { WalletDepositInput } from '@notional-finance/trade';
import { VAULT_ACTIONS } from '@notional-finance/shared-config';
import { SliderInput, SliderInputHandle } from '@notional-finance/mui';
import { useParams } from 'react-router-dom';
import { VaultSideDrawer } from '../components/vault-side-drawer';
import { useDepositCollateral } from './use-deposit-collateral';
import { messages } from '../messages';
import { RATE_PRECISION } from '@notional-finance/sdk/src/config/constants';

interface VaultParams {
  vaultAddress: string;
  sideDrawerKey?: VAULT_ACTIONS;
}

export const DepositCollateral = () => {
  const { vaultAddress } = useParams<VaultParams>();
  const inputRef = useRef<SliderInputHandle>(null);

  const {
    canSubmit,
    transactionData,
    sliderError,
    sliderInfo,
    maxLeverageRatio,
    depositError,
    targetLeverageRatio,
    primaryBorrowSymbol,
    updatedVaultAccount,
    updateDepositCollateralState,
  } = useDepositCollateral(vaultAddress);

  return (
    <VaultSideDrawer
      action={VAULT_ACTIONS.DEPOSIT_COLLATERAL}
      canSubmit={canSubmit}
      transactionData={transactionData}
      vaultAddress={vaultAddress}
      updatedVaultAccount={updatedVaultAccount}
    >
      {primaryBorrowSymbol && targetLeverageRatio && (
        <WalletDepositInput
          availableTokens={[primaryBorrowSymbol]}
          selectedToken={primaryBorrowSymbol}
          onChange={({ inputAmount, hasError }) => {
            updateDepositCollateralState({
              depositAmount: inputAmount,
              hasError,
            });
          }}
          inputLabel={messages[VAULT_ACTIONS.DEPOSIT_COLLATERAL]['inputLabel']}
          errorMsgOverride={depositError}
        />
      )}
      <SliderInput
        ref={inputRef}
        min={0}
        max={maxLeverageRatio / RATE_PRECISION}
        onChangeCommitted={(newLeverageRatio) =>
          updateDepositCollateralState({
            targetLeverageRatio: Math.floor(newLeverageRatio * RATE_PRECISION),
          })
        }
        errorMsg={sliderError}
        infoMsg={sliderInfo}
        inputLabel={messages[VAULT_ACTIONS.DEPOSIT_COLLATERAL].leverage}
      />
    </VaultSideDrawer>
  );
};
