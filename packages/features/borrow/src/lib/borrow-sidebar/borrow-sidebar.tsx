import { useEffect, useCallback } from 'react';
import { PageLoading, Maturities, ActionSidebar, useCurrencyInputRef } from '@notional-finance/mui';
import {
  TransactionConfirmation,
  TradeActionButton,
  LendBorrowInput,
  CollateralSelect,
  TokenApprovalView,
} from '@notional-finance/trade';
import { RiskSlider, AccountRiskTable } from '@notional-finance/risk';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { LEND_BORROW } from '@notional-finance/shared-config';
import { defineMessage, FormattedMessage } from 'react-intl';
import { updateBorrowState } from '../store/borrow-store';
import { useBorrow } from '../store/use-borrow';
import { useBorrowTransaction } from '../store/use-borrow-transaction';
import { BorrowParams } from '../borrow-feature-shell';
import { useCurrency } from '@notional-finance/notionable-hooks';

export const BorrowSidebar = () => {
  const { currency: selectedToken, collateral: selectedCollateral } =
    useParams<BorrowParams>();
  const {
    tradableCurrencySymbols: availableCurrencies,
    allCurrencySymbols: collateralCurrencies,
  } = useCurrency();
  const { maturityData, selectedMarketKey, canSubmit, updatedAccountData } =
    useBorrow(selectedToken);
  const txnData = useBorrowTransaction(selectedToken);
  const history = useHistory();
  const { pathname, search } = useLocation();
  const { currencyInputRef } = useCurrencyInputRef();

  const handleTxnCancel = useCallback(() => {
    history.push(pathname);
  }, [history, pathname]);

  useEffect(() => {
    if (search.includes('confirm=true')) {
      handleTxnCancel();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const maturityCards = (
    <Maturities
      maturityData={maturityData || []}
      onSelect={(selectedMarketKey) => {
        updateBorrowState({ selectedMarketKey });
      }}
      currentMarketKey={selectedMarketKey}
      inputLabel={defineMessage({
        defaultMessage: '1. Select a maturity & fix your rate',
        description: 'input label',
      })}
    />
  );

  const currencyInputHandler =
    availableCurrencies.length && selectedToken ? (
      <LendBorrowInput
        ref={currencyInputRef}
        inputRef={currencyInputRef}
        availableTokens={availableCurrencies}
        selectedToken={selectedToken}
        isRemoveAsset={false}
        cashOrfCash={'Cash'}
        lendOrBorrow={LEND_BORROW.BORROW}
        selectedMarketKey={selectedMarketKey}
        onChange={({
          selectedToken: newToken,
          inputAmount,
          hasError,
          netfCashAmount,
        }) => {
          if (newToken !== selectedToken) {
            history.push(
              `/${LEND_BORROW.BORROW}/${newToken}/${selectedCollateral}`
            );
          }
          updateBorrowState({
            inputAmount,
            hasError,
            fCashAmount: netfCashAmount,
          });
        }}
        inputLabel={defineMessage({
          defaultMessage: '2. How much do you want to borrow?',
          description: 'input label',
        })}
      />
    ) : (
      <PageLoading />
    );

  const collateralSelect =
    collateralCurrencies.length && selectedCollateral ? (
      <CollateralSelect
        tightMarginTop
        availableTokens={collateralCurrencies}
        selectedToken={selectedCollateral}
        selectedBorrowMarketKey={selectedMarketKey}
        inputLabel={defineMessage({
          defaultMessage:
            '3. How much additional collateral do you want to deposit?',
          description: 'input label',
        })}
        onChange={(
          newCollateral,
          collateralAction,
          hasCollateralError,
          collateralApy,
          collateralSymbol
        ) => {
          if (newCollateral !== selectedCollateral) {
            history.push(
              `/${LEND_BORROW.BORROW}/${selectedToken}/${newCollateral}`
            );
          }

          updateBorrowState({
            collateralAction,
            hasCollateralError,
            collateralApy,
            collateralSymbol,
          });
        }}
      />
    ) : null;

  return txnData ? (
    <TransactionConfirmation
      heading={
        <FormattedMessage
          defaultMessage="Borrow Order"
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
        defaultMessage: 'Borrow Order',
        description: 'section heading',
      })}
      helptext={defineMessage({
        defaultMessage:
          'Borrow with confidence, fixed rates lock in what you pay.',
        description: 'helptext',
      })}
      CustomActionButton={TradeActionButton}
      canSubmit={canSubmit}
    >
      {maturityCards}
      {currencyInputHandler}
      {collateralSelect}
      <TokenApprovalView symbol={selectedCollateral} />
      <RiskSlider updatedAccountData={updatedAccountData} />
      <AccountRiskTable updatedAccountData={updatedAccountData} />
    </ActionSidebar>
  );
};

export default BorrowSidebar;
