import { useEffect, useContext, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Maturities,
  PageLoading,
  SliderInput,
  LabelValue,
  CountUp,
  SliderInputHandle,
} from '@notional-finance/mui';
import { RATE_PRECISION } from '@notional-finance/sdk/src/config/constants';
import { VAULT_ACTIONS } from '@notional-finance/shared-config';
import { VaultActionContext } from '../../managers';
import { VaultSideDrawer } from '../components/vault-side-drawer';
import { useVault } from '@notional-finance/notionable-hooks';
import { useVaultActionErrors } from '../../hooks';
import { WalletDepositInput } from '@notional-finance/trade';
import { messages } from '../messages';

interface VaultParams {
  vaultAddress: string;
  sideDrawerKey?: VAULT_ACTIONS;
}

export const CreateVaultPosition = () => {
  const { vaultAddress } = useParams<VaultParams>();
  const { updateState, state } = useContext(VaultActionContext);
  const {
    selectedMarketKey,
    vaultMaturityData,
    fCashBorrowAmount,
    leverageRatio,
    updatedVaultAccount,
  } = state;
  const { minBorrowSize, maxLeverageRatio, primaryBorrowSymbol } =
    useVault(vaultAddress);
  const {
    underMinAccountBorrow,
    inputErrorMsg,
    leverageRatioError,
    canSubmit,
  } = useVaultActionErrors();

  const sliderInputRef = useRef<SliderInputHandle>(null);
  const isInputRefDefined = !!sliderInputRef.current;
  const setSliderInput = useCallback(
    (input: number) => {
      sliderInputRef.current?.setInputOverride(input);
    },
    // isInputRefDefined must be in the dependencies otherwise the useCallback will not
    // properly trigger to generate a new function when the input ref becomes defined
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sliderInputRef, isInputRefDefined]
  );

  useEffect(() => {
    if (leverageRatio) setSliderInput(leverageRatio / RATE_PRECISION);
  }, [leverageRatio, setSliderInput]);

  if (!primaryBorrowSymbol) return <PageLoading />;

  const borrowAmount = (
    <LabelValue inline error={underMinAccountBorrow}>
      <CountUp
        value={fCashBorrowAmount?.abs().toFloat() || 0}
        suffix={` ${primaryBorrowSymbol}`}
        decimals={3}
      />
    </LabelValue>
  );

  return (
    <VaultSideDrawer
      action={VAULT_ACTIONS.CREATE_VAULT_POSITION}
      transactionData={undefined}
      vaultAddress={vaultAddress}
      canSubmit={canSubmit}
      updatedVaultAccount={updatedVaultAccount}
    >
      <Maturities
        maturityData={vaultMaturityData || []}
        onSelect={(marketKey: string | null) => {
          updateState({ selectedMarketKey: marketKey || '' });
        }}
        currentMarketKey={selectedMarketKey || ''}
        inputLabel={messages[VAULT_ACTIONS.CREATE_VAULT_POSITION].maturity}
      />
      <WalletDepositInput
        availableTokens={[primaryBorrowSymbol]}
        selectedToken={primaryBorrowSymbol}
        onChange={({ inputAmount, hasError }) => {
          updateState({ depositAmount: inputAmount, hasError });
        }}
        inputLabel={messages[VAULT_ACTIONS.CREATE_VAULT_POSITION].depositAmount}
        errorMsgOverride={inputErrorMsg}
      />
      <SliderInput
        ref={sliderInputRef}
        min={0}
        max={maxLeverageRatio / RATE_PRECISION}
        onChangeCommitted={(leverageRatio) =>
          updateState({
            leverageRatio: Math.floor(leverageRatio * RATE_PRECISION),
          })
        }
        errorMsg={
          leverageRatioError ||
          (underMinAccountBorrow
            ? Object.assign(messages.error.underMinBorrow, {
                values: { minBorrowSize, borrowAmount },
              })
            : undefined)
        }
        infoMsg={Object.assign(messages.summary.borrowAmount, {
          values: { borrowAmount },
        })}
        inputLabel={messages[VAULT_ACTIONS.CREATE_VAULT_POSITION].leverage}
      />
    </VaultSideDrawer>
  );
};
