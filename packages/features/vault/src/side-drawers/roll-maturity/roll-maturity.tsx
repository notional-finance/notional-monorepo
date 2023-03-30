import { useCallback, useContext, useRef, useEffect } from 'react';
import { WalletDepositInput } from '@notional-finance/trade';
import {
  SliderInput,
  SliderInputHandle,
  Maturities,
} from '@notional-finance/mui';
import { VAULT_ACTIONS } from '@notional-finance/shared-config';
import { VaultSideDrawer } from '../components/vault-side-drawer';
import { VaultActionContext } from '../../vault-view/vault-action-provider';
import { RATE_PRECISION } from '@notional-finance/sdk/src/config/constants';
import { useRollMaturity } from './use-roll-maturity';
import { messages } from '../../messages';
import { DebtAmountCaption, TransactionCostCaption } from '../../components';

export const RollMaturity = () => {
  const {
    updateState,
    state: {
      selectedMarketKey,
      borrowMarketData,
      primaryBorrowSymbol,
      maxLeverageRatio,
      leverageRatio,
    },
  } = useContext(VaultActionContext);
  const transactionData = useRollMaturity();
  const inputRef = useRef<SliderInputHandle>(null);
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
      <Maturities
        maturityData={borrowMarketData || []}
        onSelect={(marketKey: string | null) => {
          updateState({ selectedMarketKey: marketKey || '' });
        }}
        currentMarketKey={selectedMarketKey || ''}
        inputLabel={messages[VAULT_ACTIONS.ROLL_POSITION].maturity}
      />
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
          inputLabel={messages[VAULT_ACTIONS.ROLL_POSITION]['inputLabel']}
          errorMsgOverride={undefined}
        />
      )}
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
        inputLabel={messages[VAULT_ACTIONS.ROLL_POSITION].leverage}
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
