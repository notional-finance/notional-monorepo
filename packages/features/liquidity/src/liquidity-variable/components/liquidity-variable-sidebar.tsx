import { useContext } from 'react';
import {
  TradeActionButton,
  DepositInput,
  Confirmation2,
} from '@notional-finance/trade';
import { ActionSidebar, useCurrencyInputRef } from '@notional-finance/mui';
import { defineMessage, FormattedMessage } from 'react-intl';
import { LiquidityContext } from '../liquidity-variable';

export const LiquidityVariableSidebar = () => {
  const {
    state: { canSubmit, populatedTransaction, confirm },
    updateState,
  } = useContext(LiquidityContext);
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
          defaultMessage={'Provide Liquidity'}
          description="section heading"
        />
      }
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
      handleLeverUpToggle={handleLeverUpToggle}
      handleSubmit={handleSubmit}
      leveredUp={false}
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

export default LiquidityVariableSidebar;
