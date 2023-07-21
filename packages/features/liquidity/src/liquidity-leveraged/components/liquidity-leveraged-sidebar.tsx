import { useContext } from 'react';
import {
  TradeActionButton,
  DepositInput,
  Confirmation2,
  VariableFixedMaturityToggle,
  LeverageSlider,
} from '@notional-finance/trade';
import { useHistory } from 'react-router-dom';
import { ActionSidebar, useCurrencyInputRef } from '@notional-finance/mui';
import { defineMessage, FormattedMessage } from 'react-intl';
import { LiquidityContext } from '../liquidity-leveraged';

export const LiquidityLeveragedSidebar = () => {
  const history = useHistory();
  const {
    state: { canSubmit, populatedTransaction, confirm, selectedDepositToken },
    updateState,
  } = useContext(LiquidityContext);
  const { currencyInputRef } = useCurrencyInputRef();

  const handleLeverUpToggle = () => {
    history.push(`/liquidity-variable/${selectedDepositToken}`);
  };

  const handleSubmit = () => {
    updateState({ confirm: true });
  };

  return confirm && populatedTransaction ? (
    <Confirmation2
      heading={
        <FormattedMessage
          defaultMessage={'Leveraged Liquidity'}
          description="section heading"
        />
      }
      context={LiquidityContext}
    />
  ) : (
    <ActionSidebar
      heading={defineMessage({
        defaultMessage: 'Leveraged Liquidity',
        description: 'section heading',
      })}
      helptext={defineMessage({
        defaultMessage:
          'Multiple your returns by providing liquidity with leverage. Select your borrow rate and leverage and put on the whole position in one transaction.',
        description: 'helptext',
      })}
      hideTextOnMobile
      CustomActionButton={TradeActionButton}
      canSubmit={canSubmit}
      handleLeverUpToggle={handleLeverUpToggle}
      handleSubmit={handleSubmit}
      leveredUp={true}
    >
      <DepositInput
        ref={currencyInputRef}
        inputRef={currencyInputRef}
        context={LiquidityContext}
        newRoute={(newToken) => `/liquidity-leveraged/${newToken}`}
        inputLabel={defineMessage({
          defaultMessage: '1. Enter deposit amount',
          description: 'input label',
        })}
      />
      <VariableFixedMaturityToggle context={LiquidityContext} />
      <LeverageSlider
        context={LiquidityContext}
        maxLeverageRatio={10}
        defaultLeverageRatio={5}
        inputLabel={defineMessage({
          defaultMessage: '3. Specify your leverage',
          description: 'input label',
        })}
      />
    </ActionSidebar>
  );
};

export default LiquidityLeveragedSidebar;
