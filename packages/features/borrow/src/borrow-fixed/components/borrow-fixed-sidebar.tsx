import { useEffect, useCallback } from 'react';
import {
  Maturities,
  ActionSidebar,
  useCurrencyInputRef,
} from '@notional-finance/mui';
import {
  TransactionConfirmation,
  TradeActionButton,
  LendBorrowInput,
  // CollateralSelect,
  TokenApprovalView,
  // tradeErrors,
} from '@notional-finance/trade';
import { RiskSlider, AccountRiskTable } from '@notional-finance/risk';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { LEND_BORROW } from '@notional-finance/shared-config';
import { defineMessage, FormattedMessage } from 'react-intl';
import { updateBorrowState } from '../../store/borrow-store';
import { useBorrow } from '../../store/use-borrow';
import { useBorrowTransaction } from '../../store/use-borrow-transaction';
import { BorrowParams } from '../borrow-fixed';

export const BorrowFixedSidebar = () => {
  const {
    selectedDepositToken: selectedToken,
    selectedCollateralToken: selectedCollateral,
  } = useParams<BorrowParams>();
  const availableCurrencies = [] as string[];
  const {
    maturityData,
    selectedMarketKey,
    canSubmit,
    updatedAccountData,
    // insufficientCollateralError,
    borrowToPortfolio,
    warningMsg,
  } = useBorrow(selectedToken);
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
      advancedToggle={{
        isChecked: borrowToPortfolio,
        onToggle: (isChecked) => {
          updateBorrowState({ borrowToPortfolio: isChecked });
        },
        label: <FormattedMessage defaultMessage={'Borrow To Portfolio'} />,
      }}
    >
      <Maturities
        maturityData={maturityData || []}
        onSelect={(selectedMarketKey) => {
          updateBorrowState({ selectedMarketKey });
        }}
        selectedfCashId={selectedMarketKey || undefined}
        inputLabel={defineMessage({
          defaultMessage: '1. Select a maturity & fix your rate',
          description: 'input label',
        })}
      />
      {availableCurrencies.length > 0 && selectedToken && (
        <LendBorrowInput
          ref={currencyInputRef}
          inputRef={currencyInputRef}
          availableTokens={availableCurrencies}
          selectedToken={selectedToken}
          isRemoveAsset={false}
          cashOrfCash={'Cash'}
          warningMsg={warningMsg}
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
      )}
      {/* 
      TODO: Figure out why this causes the page to crash
      {collateralCurrencies.length > 0 && selectedCollateral && (
        <CollateralSelect
          tightMarginTop
          availableTokens={collateralCurrencies}
          selectedToken={selectedCollateral}
          selectedBorrowMarketKey={selectedMarketKey}
          errorMsg={
            insufficientCollateralError
              ? tradeErrors.insufficientCollateral
              : undefined
          }
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
      )} */}
      <TokenApprovalView symbol={selectedCollateral} />
      <RiskSlider updatedAccountData={updatedAccountData} />
      <AccountRiskTable updatedAccountData={updatedAccountData} />
    </ActionSidebar>
  );
};

export default BorrowFixedSidebar;
