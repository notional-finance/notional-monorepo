import { useCurrencyInputRef } from '@notional-finance/mui';
import { DepositInput } from '@notional-finance/trade';
import { TransactionScreen } from '../transaction-screen';
import { observer } from 'mobx-react-lite';
import { defineMessage, MessageDescriptor } from 'react-intl';
import {
  useCurrentTradeContext,
  useTradeContext,
} from '@notional-finance/notionable-hooks';
import { TokenBalance } from '@notional-finance/core-entities';
import { useState } from 'react';

const insufficientBalanceMsg = defineMessage({
  defaultMessage: 'Insufficient balance',
});

const overMaxRepayAmountMsg = defineMessage({
  defaultMessage: 'Over max repay amount',
});

export const VaultRepayScreen = observer(() => {
  const { currencyInputRef } = useCurrencyInputRef();
  useTradeContext('RepayVault');
  const trade = useCurrentTradeContext();
  const maxWalletBalance = useWalletBalances(trade?.selectedNetwork);
  const maxRepayAmount = trade?.getVaultMaxRepayAmount();
  const [balanceError, setBalanceError] = useState<
    MessageDescriptor | undefined
  >(undefined);

  const onUpdate = (inputAmount: TokenBalance | undefined) => {
    trade?.setDepositBalance(inputAmount, false);

    if (inputAmount && inputAmount.gt(maxWalletBalance)) {
      setBalanceError(insufficientBalanceMsg);
    } else if (inputAmount && inputAmount.gt(maxRepayAmount)) {
      setBalanceError(overMaxRepayAmountMsg);
    } else {
      setBalanceError(undefined);
    }
  };

  const onMaxValue = () => {
    trade?.setDepositBalance(
      maxRepayAmount.lt(maxWalletBalance) ? maxRepayAmount : maxWalletBalance,
      true
    );
  };

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
          onUpdate={onUpdate}
          onMaxValue={onMaxValue}
          errorMsgOverride={balanceError}
        />,
      ]}
    />
  );
});
