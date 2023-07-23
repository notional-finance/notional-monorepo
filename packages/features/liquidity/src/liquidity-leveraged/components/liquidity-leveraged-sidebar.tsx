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
import { LeveragedLiquidityContext } from '../liquidity-leveraged';
import { PRODUCTS } from '@notional-finance/shared-config';

export const LiquidityLeveragedSidebar = () => {
  const history = useHistory();
  const {
    state: { canSubmit, populatedTransaction, confirm, selectedDepositToken },
    updateState,
  } = useContext(LeveragedLiquidityContext);
  const { currencyInputRef } = useCurrencyInputRef();

  const handleLeverUpToggle = () => {
    history.push(`/${PRODUCTS.LIQUIDITY_VARIABLE}/${selectedDepositToken}`);
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
      context={LeveragedLiquidityContext}
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
        context={LeveragedLiquidityContext}
        newRoute={(newToken) => `/${PRODUCTS.LIQUIDITY_LEVERAGED}/${newToken}`}
        inputLabel={defineMessage({
          defaultMessage: '1. Enter deposit amount',
          description: 'input label',
        })}
      />
      <VariableFixedMaturityToggle context={LeveragedLiquidityContext} />
      <LeverageSlider
        context={LeveragedLiquidityContext}
        inputLabel={defineMessage({
          defaultMessage: '3. Specify your leverage',
          description: 'input label',
        })}
      />
    </ActionSidebar>
  );
};

export default LiquidityLeveragedSidebar;
