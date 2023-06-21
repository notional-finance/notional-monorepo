import { useEffect, useCallback, useContext } from 'react';
import { defineMessage, FormattedMessage } from 'react-intl';
import { ActionSidebar, useCurrencyInputRef } from '@notional-finance/mui';
import {
  TradeActionButton,
  DepositInput,
  Confirmation2,
} from '@notional-finance/trade';
import { useHistory, useLocation } from 'react-router-dom';
import { LEND_BORROW } from '@notional-finance/shared-config';
import { LendFixedContext } from '../../lend-fixed/lend-fixed';

export const LendVariableSidebar = () => {
  const {
    state: { canSubmit, buildTransactionCall, confirm },
  } = useContext(LendFixedContext);
  const history = useHistory();
  const { pathname, search } = useLocation();
  const { currencyInputRef } = useCurrencyInputRef();

  const handleTxnCancel = useCallback(() => {
    history.push(pathname);
  }, [history, pathname]);

  const handleLeverUpToggle = () => {
    console.log('handleLeverUpToggle');
  };

  useEffect(() => {
    if (search.includes('confirm=true')) {
      handleTxnCancel();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return confirm && buildTransactionCall ? (
    <Confirmation2
      heading={
        <FormattedMessage
          defaultMessage="Lend Order"
          description="section heading"
        />
      }
      onCancel={handleTxnCancel}
      context={LendFixedContext}
    />
  ) : (
    <ActionSidebar
      heading={defineMessage({
        defaultMessage: 'Variable Lending',
        description: 'section heading',
      })}
      helptext={defineMessage({
        defaultMessage:
          'Earn passive income with market-leading variable interest rates and full redeemability. Withdraw your cash whenever you need it.',
        description: 'helptext',
      })}
      CustomActionButton={TradeActionButton}
      canSubmit={canSubmit}
      handleLeverUpToggle={handleLeverUpToggle}
      leveredUp={false}
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
    </ActionSidebar>
  );
};

export default LendVariableSidebar;
