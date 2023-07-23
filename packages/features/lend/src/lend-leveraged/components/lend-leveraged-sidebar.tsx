import { useCallback, useContext } from 'react';
import { defineMessage, FormattedMessage } from 'react-intl';
import { ActionSidebar, useCurrencyInputRef } from '@notional-finance/mui';
import {
  TradeActionButton,
  DepositInput,
  Confirmation2,
  LeverageSlider,
} from '@notional-finance/trade';
import { useHistory } from 'react-router-dom';
import { PRODUCTS } from '@notional-finance/shared-config';
import { LendLeveragedContext } from '../../lend-leveraged/lend-leveraged';
import { LeveragedLendMaturitySelector } from './leveraged-lend-maturity-selector';

export const LendLeveragedSidebar = () => {
  const history = useHistory();
  const {
    state: { canSubmit, populatedTransaction, confirm, selectedDepositToken },
    updateState,
  } = useContext(LendLeveragedContext);
  const { currencyInputRef } = useCurrencyInputRef();

  const handleLeverUpToggle = useCallback(() => {
    // The two lending pages will pass a state object into this page to
    // remember where the toggle will go back to
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const state: any = history.location.state || {};

    // Use this if condition check because this toggle gets executed twice
    // on a second page load
    if (history.location.pathname.includes(PRODUCTS.LEND_LEVERAGED)) {
      history.push(
        `/${state['from'] || PRODUCTS.LEND_FIXED}/${selectedDepositToken}`
      );
    }
  }, [history, selectedDepositToken]);

  const handleSubmit = () => {
    updateState({ confirm: true });
  };

  return confirm && populatedTransaction ? (
    <Confirmation2
      heading={
        <FormattedMessage
          defaultMessage="Lend Order"
          description="section heading"
        />
      }
      context={LendLeveragedContext}
    />
  ) : (
    <ActionSidebar
      heading={defineMessage({
        defaultMessage: 'Leveraged Lending',
        description: 'section heading',
      })}
      helptext={defineMessage({
        defaultMessage:
          "Arbitrage Notional's interest rates by borrowing at a low rate and lending at a higher one with leverage for maximum returns.",
        description: 'helptext',
      })}
      CustomActionButton={TradeActionButton}
      canSubmit={canSubmit}
      handleSubmit={handleSubmit}
      handleLeverUpToggle={handleLeverUpToggle}
      leveredUp={true}
    >
      <DepositInput
        ref={currencyInputRef}
        inputRef={currencyInputRef}
        context={LendLeveragedContext}
        newRoute={(newToken) => `/${PRODUCTS.LEND_LEVERAGED}/${newToken}`}
        inputLabel={defineMessage({
          defaultMessage: '1. Enter deposit amount',
          description: 'input label',
        })}
      />
      <LeveragedLendMaturitySelector />
      <LeverageSlider
        context={LendLeveragedContext}
        inputLabel={defineMessage({
          defaultMessage: '3. Specify your leverage',
          description: 'input label',
        })}
      />
    </ActionSidebar>
  );
};

export default LendLeveragedSidebar;
