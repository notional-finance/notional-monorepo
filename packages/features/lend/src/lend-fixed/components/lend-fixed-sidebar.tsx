import { useContext } from 'react';
import { defineMessage } from 'react-intl';
import { useCurrencyInputRef } from '@notional-finance/mui';
import {
  DepositInput,
  MaturitySelect,
  TransactionSidebar,
} from '@notional-finance/trade';
import { PRODUCTS } from '@notional-finance/util';
import { LendFixedContext } from '../../lend-fixed/lend-fixed';
import { TransactionNetworkSelector } from '@notional-finance/wallet';

export const LendFixedSidebar = () => {
  const context = useContext(LendFixedContext);
  const { currencyInputRef } = useCurrencyInputRef();
  const { selectedNetwork } = context.state;

  return (
    <TransactionSidebar
      context={context}
      showDrawer
      NetworkSelector={
        <TransactionNetworkSelector
          product={PRODUCTS.LEND_FIXED}
          context={context}
        />
      }
    >
      <DepositInput
        ref={currencyInputRef}
        inputRef={currencyInputRef}
        context={context}
        newRoute={(newToken) =>
          `/${PRODUCTS.LEND_FIXED}/${selectedNetwork}/${newToken}`
        }
        showScrollPopper
        inputLabel={defineMessage({
          defaultMessage: '1. How much do you want to lend?',
          description: 'input label',
        })}
      />
      <MaturitySelect
        context={context}
        category={'Collateral'}
        inputLabel={defineMessage({
          defaultMessage: '2. Select a maturity & fix your rate',
          description: 'input label',
        })}
      />
    </TransactionSidebar>
  );
};

export default LendFixedSidebar;
