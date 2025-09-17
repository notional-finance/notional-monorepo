import { useCurrencyInputRef } from '@notional-finance/mui';
import { DepositInput } from '@notional-finance/trade';
import { TransactionScreen } from '../transaction-screen';
import { observer } from 'mobx-react-lite';
import { defineMessage } from 'react-intl';
import {
  useCurrentTradeContext,
  useTradeContext,
} from '@notional-finance/notionable-hooks';

export const VaultFinalizeWithdraw = observer(() => {
  const { currencyInputRef, setCurrencyInput } = useCurrencyInputRef();
  useTradeContext('FinalizeWithdraw');
  const trade = useCurrentTradeContext();
  // TODO: this is not correct, we need to get the max withdraw from the pending withdraw
  const maxWithdraw = trade?.getVaultMaxWithdraw();

  return (
    <TransactionScreen
      actionPrefix="Finalize Withdraw"
      inputs={[
        <DepositInput
          key="withdraw-input"
          inputLabel={defineMessage({
            defaultMessage: 'Withdraw',
          })}
          ref={currencyInputRef}
          inputRef={currencyInputRef}
          isWithdraw
          maxWithdraw={maxWithdraw?.maxWithdrawUnderlying}
          onMaxValue={() => {
            if (trade && maxWithdraw) {
              trade.setVaultMaxWithdraw();
              setCurrencyInput(
                maxWithdraw.maxWithdrawUnderlying.toExactString(),
                false
              );
            }
          }}
        />,
      ]}
    />
  );
});
