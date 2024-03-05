import { useContext } from 'react';
import { DepositInput, TransactionSidebar } from '@notional-finance/trade';
import { useCurrencyInputRef } from '@notional-finance/mui';
import { defineMessage } from 'react-intl';
import { LiquidityContext } from '../liquidity';
import { PRODUCTS } from '@notional-finance/util';
import { NetworkSelector } from '@notional-finance/wallet';

export const LiquidityVariableSidebar = () => {
  const context = useContext(LiquidityContext);
  const { currencyInputRef } = useCurrencyInputRef();
  const { selectedNetwork } = context.state;

  return (
    <TransactionSidebar
      context={context}
      showDrawer
      NetworkSelector={
        <NetworkSelector
          product={PRODUCTS.LIQUIDITY_VARIABLE}
          context={context}
        />
      }
    >
      <DepositInput
        showScrollPopper
        ref={currencyInputRef}
        inputRef={currencyInputRef}
        context={context}
        newRoute={(newToken) =>
          `/${PRODUCTS.LIQUIDITY_VARIABLE}/${selectedNetwork}/${newToken}`
        }
        inputLabel={defineMessage({
          defaultMessage: '1. How much liquidity do you want to provide?',
          description: 'input label',
        })}
      />
    </TransactionSidebar>
  );
};

export default LiquidityVariableSidebar;
