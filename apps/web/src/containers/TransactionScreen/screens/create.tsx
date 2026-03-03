import { useCurrencyInputRef } from '@notional-finance/mui';
import { DepositInput, LeverageSlider } from '@notional-finance/trade';
import { TransactionScreen } from '../transaction-screen';
import { observer } from 'mobx-react-lite';
import { defineMessage } from 'react-intl';
import {
  useCurrentTradeContext,
  useTradeContext,
} from '@notional-finance/notionable-hooks';
import { TokenDefinition } from '@notional-finance/core-entities';
import { useLocation } from 'react-router-dom';

export const VaultCreateScreen = observer(() => {
  const { currencyInputRef } = useCurrencyInputRef();
  const location = useLocation();
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
          depositTokens={trade?.availableTokens.deposit}
          newRoute={(
            tokenSymbol: string | null,
            newToken: TokenDefinition | null
          ) => {
            if (tokenSymbol && newToken) {
              trade?.setDepositToken(newToken);
              return `${location.pathname}?deposit=${tokenSymbol}`;
            }
            return location.pathname;
          }}
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
