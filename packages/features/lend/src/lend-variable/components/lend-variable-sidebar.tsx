import { useContext } from 'react';
import { defineMessage } from 'react-intl';
import { useCurrencyInputRef } from '@notional-finance/mui';
import { DepositInput, TransactionSidebar } from '@notional-finance/trade';
import { PRODUCTS } from '@notional-finance/util';
import { LendVariableContext } from '../../lend-variable/lend-variable';
import { NetworkSelector } from '@notional-finance/wallet';

export const LendVariableSidebar = () => {
  const context = useContext(LendVariableContext);
  const { currencyInputRef } = useCurrencyInputRef();
  const { selectedNetwork } = context.state;

  return (
    <TransactionSidebar
      context={context}
      showDrawer
      NetworkSelector={
        <NetworkSelector product={PRODUCTS.LEND_VARIABLE} context={context} />
      }
    >
      <DepositInput
        showScrollPopper
        ref={currencyInputRef}
        inputRef={currencyInputRef}
        context={context}
        newRoute={(newToken) =>
          `/${PRODUCTS.LEND_VARIABLE}/${selectedNetwork}/${newToken}`
        }
        inputLabel={defineMessage({
          defaultMessage: '1. How much do you want to lend?',
          description: 'input label',
        })}
      />
    </TransactionSidebar>
  );
};

export default LendVariableSidebar;
