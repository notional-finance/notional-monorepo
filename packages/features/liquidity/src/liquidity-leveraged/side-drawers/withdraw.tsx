import { useContext } from 'react';
import { LiquidityContext } from '../../liquidity';
import { DepositInput, TransactionSidebar } from '@notional-finance/trade';
import { defineMessage } from 'react-intl';
import { LiquidityDetailsTable } from '../components/liquidity-details-table';
import { useMaxLiquidityWithdraw } from '../hooks/use-max-liquidity-withdraw';

export const Withdraw = () => {
  const context = useContext(LiquidityContext);
  const { currencyInputRef, onMaxValue } = useMaxLiquidityWithdraw(context);

  return (
    <TransactionSidebar
      context={context}
      heading={defineMessage({ defaultMessage: 'Withdraw' })}
      helptext={defineMessage({
        defaultMessage: 'Unwind your position and withdraw your capital.',
      })}
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
