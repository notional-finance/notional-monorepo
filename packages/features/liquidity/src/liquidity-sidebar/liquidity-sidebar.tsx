import { useCallback, useContext, useEffect } from 'react';
import {
  TradeActionButton,
  DepositInput,
  Confirmation2,
} from '@notional-finance/trade';
import { ActionSidebar, useCurrencyInputRef } from '@notional-finance/mui';
import { useHistory, useLocation } from 'react-router-dom';
import { defineMessage, FormattedMessage } from 'react-intl';
import { LiquidityContext } from '../liquidity-action';

export const LiquiditySidebar = () => {
  const {
    state: { canSubmit, buildTransactionCall, confirm },
  } = useContext(LiquidityContext);
  const { pathname, search } = useLocation();
  const history = useHistory();
  const { currencyInputRef } = useCurrencyInputRef();

  const handleTxnCancel = useCallback(() => {
    history.push(pathname);
  }, [history, pathname]);

  useEffect(() => {
    if (search.includes('confirm=true')) {
      // TODO: Clears the confirmation on load...
      history.push(pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return confirm && buildTransactionCall ? (
    <Confirmation2
      heading={
        <FormattedMessage
          defaultMessage={'Provide Liquidity'}
          description="section heading"
        />
      }
      onCancel={handleTxnCancel}
      context={LiquidityContext}
    />
  ) : (
    <ActionSidebar
      heading={defineMessage({
        defaultMessage: 'Provide Liquidity',
        description: 'section heading',
      })}
      helptext={defineMessage({
        defaultMessage:
          'You will receive nTokens in return for providing liquidity to all markets at once. nTokens earn yield from cToken supply rates, trading fees, and fCash interest. nToken holders also earn NOTE incentives.',
        description: 'helptext',
      })}
      hideTextOnMobile
      CustomActionButton={TradeActionButton}
      canSubmit={canSubmit}
    >
      <DepositInput
        ref={currencyInputRef}
        inputRef={currencyInputRef}
        context={LiquidityContext}
        newRoute={(newToken) => `/provide/${newToken}`}
        inputLabel={defineMessage({
          defaultMessage: '1. How much liquidity do you want to provide?',
          description: 'input label',
        })}
      />
      {/* <TradePropertiesGrid showBackground data={tradeProperties || {}} /> */}
    </ActionSidebar>
  );
};

export default LiquiditySidebar;
