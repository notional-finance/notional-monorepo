import { useCallback } from 'react';
import { PageLoading, Maturities, ActionSidebar } from '@notional-finance/mui';
import {
  TransactionConfirmation,
  TradeActionButton,
  LendBorrowInput,
  CollateralSelect,
  TokenApprovalView,
} from '@notional-finance/trade';
import { Box, useTheme } from '@mui/material';
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
  const theme = useTheme();
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
  const { pathname } = useLocation();

  const handleTxnCancel = useCallback(() => {
    history.push(pathname);
  }, [history, pathname]);

  const maturityCards = (
    <Box
      sx={{
        marginTop: { xs: theme.spacing(22), sm: theme.spacing(22), md: '0px' },
      }}
    >
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
    </Box>
  );

  const currencyInputHandler =
    availableCurrencies.length && selectedToken ? (
      <LendBorrowInput
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
