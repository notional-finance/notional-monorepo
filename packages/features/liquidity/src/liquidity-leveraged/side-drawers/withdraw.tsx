import { useContext } from 'react';
import { LiquidityContext } from '../../liquidity';
import {
  DepositInput,
  TransactionSidebar,
  useMaxWithdraw,
} from '@notional-finance/trade';
import { defineMessage } from 'react-intl';
import { LiquidityDetailsTable } from '../components/liquidity-details-table';

export const Withdraw = () => {
  const context = useContext(LiquidityContext);
  const { currencyInputRef, onMaxValue } = useMaxWithdraw(context);

  return (
    <TransactionSidebar
      context={context}
      riskComponent={<LiquidityDetailsTable />}
    >
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
