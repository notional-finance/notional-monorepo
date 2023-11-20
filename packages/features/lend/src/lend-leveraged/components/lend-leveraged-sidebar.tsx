import { useContext } from 'react';
import { defineMessage } from 'react-intl';
import { useCurrencyInputRef } from '@notional-finance/mui';
import {
  DepositInput,
  LeverageSlider,
  TransactionSidebar,
} from '@notional-finance/trade';
import { PRODUCTS } from '@notional-finance/util';
import { LendLeveragedContext } from '../../lend-leveraged/lend-leveraged';
import { LeveragedLendMaturitySelector } from './leveraged-lend-maturity-selector';

export const LendLeveragedSidebar = () => {
  const context = useContext(LendLeveragedContext);
  const {
    state: { deposit, debt },
  } = context;
  const { currencyInputRef } = useCurrencyInputRef();

  return (
    <TransactionSidebar
      showDrawer
      variableBorrowRequired={debt?.tokenType === 'PrimeDebt'}
      context={context}
    >
      <DepositInput
        ref={currencyInputRef}
        inputRef={currencyInputRef}
        context={context}
        newRoute={(newToken) => `/${PRODUCTS.LEND_LEVERAGED}/${newToken}`}
        inputLabel={defineMessage({
          defaultMessage: '1. Enter deposit amount',
          description: 'input label',
        })}
      />
      <LeveragedLendMaturitySelector context={context} />
      <LeverageSlider
        context={context}
        leverageCurrencyId={deposit?.currencyId}
        inputLabel={defineMessage({
          defaultMessage: '3. Specify your leverage',
          description: 'input label',
        })}
      />
    </TransactionSidebar>
  );
};

export default LendLeveragedSidebar;
