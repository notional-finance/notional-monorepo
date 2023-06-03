import { useEffect, useCallback, useContext } from 'react';
import { defineMessage, FormattedMessage } from 'react-intl';
import {
  Maturities,
  ActionSidebar,
  useCurrencyInputRef,
} from '@notional-finance/mui';
import {
  TransactionConfirmation,
  TradeActionButton,
  DepositInput,
} from '@notional-finance/trade';
import { useHistory, useLocation } from 'react-router-dom';
import { LEND_BORROW } from '@notional-finance/shared-config';
import { LendFixedContext } from '../lend-fixed';

export const LendFixedSidebar = () => {
  const {
    state: { canSubmit, buildTransactionCall, confirm },
  } = useContext(LendFixedContext);
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

  return confirm && buildTransactionCall ? (
    <TransactionConfirmation
      heading={
        <FormattedMessage
          defaultMessage="Lend Order"
          description="section heading"
        />
      }
      onCancel={handleTxnCancel}
      transactionProperties={{}}
      buildTransactionCall={buildTransactionCall}
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
      <DepositInput
        ref={currencyInputRef}
        inputRef={currencyInputRef}
        context={LendFixedContext}
        newRoute={(newToken) => `/${LEND_BORROW.LEND}/${newToken}`}
        inputLabel={defineMessage({
          defaultMessage: '1. How much do you want to lend?',
          description: 'input label',
        })}
      />
      <Maturities
        maturityData={[]}
        onSelect={(_marketKey: string | null) => {
          // updateLendState({ selectedMarketKey: marketKey });
        }}
        currentMarketKey={null}
        inputLabel={defineMessage({
          defaultMessage: '2. Select a maturity & fix your rate',
          description: 'input label',
        })}
      />
      {/* <LendBalanceInfo setInputAmount={setCurrencyInput} /> */}
    </ActionSidebar>
  );
};

export default LendFixedSidebar;
