import { useCurrencyInputRef } from '@notional-finance/mui';
import { DepositInput } from '@notional-finance/trade';
import { TransactionScreen } from '../transaction-screen';
import { observer } from 'mobx-react-lite';
import { defineMessage } from 'react-intl';
import {
  useCurrentTradeContext,
  useTradeContext,
} from '@notional-finance/notionable-hooks';

export const VaultRepayScreen = observer(() => {
  const { currencyInputRef } = useCurrencyInputRef();
  useTradeContext('RepayVault');
  const trade = useCurrentTradeContext();

  return (
    <TransactionScreen
      actionPrefix="Repay"
      hasBackButton
      inputs={[
        <DepositInput
          key="repay-input"
          inputLabel={defineMessage({
            defaultMessage: 'Repay',
          })}
          inputRef={currencyInputRef}
          depositTokens={trade?.availableTokens.deposit}
        />,
      ]}
    />
  );
});
