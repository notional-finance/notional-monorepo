import { useCurrencyInputRef } from '@notional-finance/mui';
import { DepositInput, LeverageSlider } from '@notional-finance/trade';
import { TransactionScreen } from '../transaction-screen';
import { observer } from 'mobx-react-lite';
import { defineMessage } from 'react-intl';
import { useTradeContext } from '@notional-finance/notionable-hooks';

export const VaultCreateScreen = observer(() => {
  const { currencyInputRef } = useCurrencyInputRef();
  useTradeContext('CreateVaultPosition');

  return (
    <TransactionScreen
      inputs={[
        <DepositInput
          key="deposit-input"
          inputLabel={defineMessage({
            defaultMessage: 'Deposit',
          })}
          inputRef={currencyInputRef}
        />,
        <LeverageSlider
          key="leverage-slider"
          inputLabel={defineMessage({
            defaultMessage: 'Leverage',
          })}
        />,
      ]}
    />
  );
});
