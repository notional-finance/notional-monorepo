import { useCurrencyInputRef } from '@notional-finance/mui';
import { DepositInput, LeverageSlider } from '@notional-finance/trade';
import { TransactionScreen } from '../transaction-screen';
import { observer } from 'mobx-react-lite';
import { defineMessage } from 'react-intl';
import {
  useCurrentTradeContext,
  useTradeContext,
} from '@notional-finance/notionable-hooks';

export const VaultCreateScreen = observer(() => {
  const { currencyInputRef } = useCurrencyInputRef();
  useTradeContext('CreateVaultPosition');
  const trade = useCurrentTradeContext();

  return (
    <TransactionScreen
      inputs={[
        <DepositInput
          key="deposit-input"
          inputLabel={defineMessage({
            defaultMessage: 'Deposit',
          })}
          inputRef={currencyInputRef}
          // TODO: the yield token needs the icon in here...
          depositTokens={trade?.availableTokens.deposit}
          // TODO: add new route here to switch the token symbol
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
