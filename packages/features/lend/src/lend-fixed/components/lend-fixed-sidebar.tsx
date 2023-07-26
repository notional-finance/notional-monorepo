import { useContext } from 'react';
import { defineMessage, FormattedMessage } from 'react-intl';
import { ActionSidebar, useCurrencyInputRef } from '@notional-finance/mui';
import {
  TradeActionButton,
  DepositInput,
  MaturitySelect,
  Confirmation2,
} from '@notional-finance/trade';
import { useHistory } from 'react-router-dom';
import { PRODUCTS } from '@notional-finance/shared-config';
import { LendFixedContext } from '../../lend-fixed/lend-fixed';

export const LendFixedSidebar = () => {
  const history = useHistory();
  const {
    state: { canSubmit, populatedTransaction, confirm, selectedDepositToken },
    updateState,
  } = useContext(LendFixedContext);
  const { currencyInputRef } = useCurrencyInputRef();

  const handleLeverUpToggle = () => {
    history.push(`/${PRODUCTS.LEND_LEVERAGED}/${selectedDepositToken}`, {
      from: PRODUCTS.LEND_FIXED,
    });
  };

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
      context={LendFixedContext}
    />
  ) : (
    <ActionSidebar
      heading={defineMessage({
        defaultMessage: 'Fixed Lend',
        description: 'section heading',
      })}
      helptext={defineMessage({
        defaultMessage:
          'Lock in a fixed interest rate today.  Fixed rates guarantee your APY.',
        description: 'helptext',
      })}
      CustomActionButton={TradeActionButton}
      handleSubmit={handleSubmit}
      canSubmit={canSubmit}
      handleLeverUpToggle={handleLeverUpToggle}
      leveredUp={false}
    >
      <DepositInput
        ref={currencyInputRef}
        inputRef={currencyInputRef}
        context={LendFixedContext}
        newRoute={(newToken) => `/${PRODUCTS.LEND_FIXED}/${newToken}`}
        inputLabel={defineMessage({
          defaultMessage: '1. How much do you want to lend?',
          description: 'input label',
        })}
      />
      <MaturitySelect
        context={LendFixedContext}
        category={'Collateral'}
        inputLabel={defineMessage({
          defaultMessage: '2. Select a maturity & fix your rate',
          description: 'input label',
        })}
      />
    </ActionSidebar>
  );
};

export default LendFixedSidebar;
