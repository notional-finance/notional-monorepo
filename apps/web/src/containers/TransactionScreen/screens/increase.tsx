import { useCurrencyInputRef } from '@notional-finance/mui';
import { DepositInput } from '@notional-finance/trade';
import { TransactionScreen } from '../transaction-screen';
import { observer } from 'mobx-react-lite';
import { defineMessage } from 'react-intl';
import { useTradeContext } from '@notional-finance/notionable-hooks';

export const VaultIncreaseScreen = observer(() => {
  const { currencyInputRef } = useCurrencyInputRef();
  useTradeContext('IncreaseVaultPosition');

  return (
    <TransactionScreen
      actionPrefix="Increase"
      hasBackButton
      inputs={[
        <DepositInput
          key="deposit-input"
          inputLabel={defineMessage({
            defaultMessage: 'Deposit',
          })}
          inputRef={currencyInputRef}
        />,
      ]}
    />
  );
});
