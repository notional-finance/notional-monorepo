import { useContext } from 'react';
import { LiquidityContext } from '../../liquidity';
import {
  DepositInput,
  TransactionSidebar,
  useMaxWithdraw,
} from '@notional-finance/trade';
import { defineMessage } from 'react-intl';

export const Withdraw = () => {
  const context = useContext(LiquidityContext);
  const { currencyInputRef, onMaxValue } = useMaxWithdraw(context);

  return (
    <TransactionSidebar context={context}>
      <DepositInput
        ref={currencyInputRef}
        isWithdraw
        context={context}
        inputRef={currencyInputRef}
        onMaxValue={onMaxValue}
        inputLabel={defineMessage({
          defaultMessage: 'Enter amount to withdraw',
        })}
      />
    </TransactionSidebar>
  );
};
