import { useContext } from 'react';
import { defineMessage, FormattedMessage } from 'react-intl';
import { ActionSidebar, useCurrencyInputRef } from '@notional-finance/mui';
import {
  TradeActionButton,
  DepositInput,
  Confirmation2,
} from '@notional-finance/trade';
import { PRODUCTS } from '@notional-finance/shared-config';
import { LendVariableContext } from '../../lend-variable/lend-variable';

export const LendLeveragedSidebar = () => {
  const {
    state: { canSubmit, populatedTransaction, confirm },
    updateState,
  } = useContext(LendVariableContext);
  const { currencyInputRef } = useCurrencyInputRef();

  const handleLeverUpToggle = () => {
    // TODO: hook this up to context
    console.log('handleLeverUpToggle');
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
      context={LendVariableContext}
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
      handleSubmit={handleSubmit}
      handleLeverUpToggle={handleLeverUpToggle}
      leveredUp={false}
    >
      <DepositInput
        ref={currencyInputRef}
        inputRef={currencyInputRef}
        context={LendVariableContext}
        newRoute={(newToken) => `/${PRODUCTS.LEND_VARIABLE}/${newToken}`}
        inputLabel={defineMessage({
          defaultMessage: '1. How much do you want to lend?',
          description: 'input label',
        })}
      />
    </ActionSidebar>
  );
};

export default LendLeveragedSidebar;
