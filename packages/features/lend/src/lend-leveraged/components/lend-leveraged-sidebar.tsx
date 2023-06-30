import { useContext } from 'react';
import { defineMessage, FormattedMessage } from 'react-intl';
import { ActionSidebar, useCurrencyInputRef } from '@notional-finance/mui';
import {
  TradeActionButton,
  DepositInput,
  Confirmation2,
} from '@notional-finance/trade';
import { useHistory } from 'react-router-dom';
import { PRODUCTS } from '@notional-finance/shared-config';
import { LendLeveragedContext } from '../../lend-leveraged/lend-leveraged';

export const LendLeveragedSidebar = () => {
  const history = useHistory();
  const {
    state: { canSubmit, populatedTransaction, confirm, selectedDepositToken },
    updateState,
  } = useContext(LendLeveragedContext);
  const { currencyInputRef } = useCurrencyInputRef();

  const handleLeverUpToggle = () => {
    history.push(`/lend-fixed/${selectedDepositToken}`);
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
      context={LendLeveragedContext}
    />
  ) : (
    <ActionSidebar
      heading={defineMessage({
        defaultMessage: 'Leveraged Lending',
        description: 'section heading',
      })}
      helptext={defineMessage({
        defaultMessage: 'TBD',
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
          defaultMessage: '1. How much do you want to lend?',
          description: 'input label',
        })}
      />
    </ActionSidebar>
  );
};

export default LendLeveragedSidebar;
