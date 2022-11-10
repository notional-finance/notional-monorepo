import { useCallback, useRef } from 'react';
import { defineMessage, FormattedMessage } from 'react-intl';
import {
  PageLoading,
  Maturities,
  ActionSidebar,
  CurrencyInputHandle,
} from '@notional-finance/mui';
import {
  TransactionConfirmation,
  TradeActionButton,
  TokenApprovalView,
  LendBorrowInput,
} from '@notional-finance/trade';
import { useHistory, useLocation } from 'react-router-dom';
import LendBalanceInfo from './lend-balance-info';
import { updateLendState } from '../store/lend-store';
import { useLend } from '../store/use-lend';
import { useLendTransaction } from '../store/use-lend-transaction';
import { LEND_BORROW } from '@notional-finance/shared-config';

export const LendSidebar = () => {
  const {
    availableCurrencies,
    maturityData,
    selectedMarketKey,
    selectedToken,
    canSubmit,
  } = useLend();
  const txnData = useLendTransaction();
  const history = useHistory();
  const { pathname } = useLocation();

  const handleTxnCancel = useCallback(() => {
    history.push(pathname);
  }, [history, pathname]);

  const inputRef = useRef<CurrencyInputHandle>(null);
  // This is passed into the balance info box to set the input amount
  const setInputAmount = useCallback(
    (input: string) => {
      inputRef.current?.setInputOverride(input);
    },
    [inputRef]
  );

  const currencyInputHandler =
    availableCurrencies.length && selectedToken ? (
      <LendBorrowInput
        ref={inputRef}
        availableTokens={availableCurrencies}
        selectedToken={selectedToken}
        isRemoveAsset={false}
        cashOrfCash={'Cash'}
        lendOrBorrow={LEND_BORROW.LEND}
        selectedMarketKey={selectedMarketKey}
        onChange={({
          selectedToken: newToken,
          inputAmount,
          hasError,
          netfCashAmount,
        }) => {
          if (newToken !== selectedToken) {
            history.push(`/${LEND_BORROW.LEND}/${newToken}`);
          }
          updateLendState({
            inputAmount,
            hasError,
            fCashAmount: netfCashAmount,
          });
        }}
        inputLabel={defineMessage({
          defaultMessage: '2. How much do you want to lend?',
          description: 'input label',
        })}
      />
    ) : (
      <PageLoading />
    );

  return txnData ? (
    <TransactionConfirmation
      heading={
        <FormattedMessage
          defaultMessage="Lend Order"
          description="section heading"
        />
      }
      onCancel={handleTxnCancel}
      transactionProperties={txnData?.transactionProperties}
      buildTransactionCall={txnData?.buildTransactionCall}
    />
  ) : (
    <ActionSidebar
      heading={defineMessage({
        defaultMessage: 'Lend With Confidence',
        description: 'section heading',
      })}
      helptext={defineMessage({
        defaultMessage:
          'Lock in a fixed interest rate today.  Fixed rates guarantee your APY.',
        description: 'helptext',
      })}
      CustomActionButton={TradeActionButton}
      canSubmit={canSubmit}
    >
      <Maturities
        maturityData={maturityData || []}
        onSelect={(marketKey: string | null) => {
          updateLendState({ selectedMarketKey: marketKey });
        }}
        currentMarketKey={selectedMarketKey}
        inputLabel={defineMessage({
          defaultMessage: '1. Select a maturity & fix your rate',
          description: 'input label',
        })}
      />
      {currencyInputHandler}
      <LendBalanceInfo setInputAmount={setInputAmount} />
      <TokenApprovalView />
    </ActionSidebar>
  );
};

export default LendSidebar;
