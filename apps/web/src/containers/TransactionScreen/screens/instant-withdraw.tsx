import { useCurrencyInputRef } from '@notional-finance/mui';
import { DepositInput } from '@notional-finance/trade';
import { TransactionScreen } from '../transaction-screen';
import { observer } from 'mobx-react-lite';
import { defineMessage } from 'react-intl';
import {
  useCurrentTradeContext,
  useTradeContext,
} from '@notional-finance/notionable-hooks';

export const VaultInstantWithdraw = observer(() => {
  const { currencyInputRef, setCurrencyInput } = useCurrencyInputRef();
  useTradeContext('WithdrawVault');
  const trade = useCurrentTradeContext();
  const maxWithdraw = trade?.getVaultMaxWithdraw();

  return (
    <TransactionScreen
      actionPrefix="Instant Withdraw"
      hasBackButton
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
