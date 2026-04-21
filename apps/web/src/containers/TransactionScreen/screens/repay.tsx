import { useCurrencyInputRef } from '@notional-finance/mui';
import { DepositInput } from '@notional-finance/trade';
import { TransactionScreen } from '../transaction-screen';
import { observer } from 'mobx-react-lite';
import { defineMessage, MessageDescriptor } from 'react-intl';
import {
  useCurrentTradeContext,
  useTradeContext,
  useWalletBalanceInputCheck,
} from '@notional-finance/notionable-hooks';
import { TokenBalance } from '@notional-finance/core-entities';
import { useState } from 'react';

const insufficientBalanceMsg = defineMessage({
  defaultMessage: 'Insufficient Balance',
});

const overMaxRepayAmountMsg = defineMessage({
  defaultMessage: 'Above Outstanding Debt',
});

export const VaultRepayScreen = observer(() => {
  const { currencyInputRef, setCurrencyInput } = useCurrencyInputRef();
  useTradeContext('RepayVault');
  const trade = useCurrentTradeContext();
  const { maxBalance } = useWalletBalanceInputCheck(
    trade?.selectedTokens.deposit,
    undefined
  );
  const maxRepayAmount = trade
    ?.getPriorVaultBalances()
    ?.find((b) => b.token.id === trade?.selectedTokens.debt?.id)
    ?.toUnderlying()
    .neg();
  const [balanceError, setBalanceError] = useState<
    MessageDescriptor | undefined
  >(undefined);

  const onUpdate = (inputAmount: TokenBalance | undefined) => {
    trade?.setDepositBalance(inputAmount, false);
    setCurrencyInput(inputAmount?.toExactString() || '', false);

    if (inputAmount && maxRepayAmount && inputAmount.gt(maxRepayAmount)) {
      setBalanceError(overMaxRepayAmountMsg);
    } else if (inputAmount && maxBalance && inputAmount.gt(maxBalance)) {
      setBalanceError(insufficientBalanceMsg);
    } else {
      setBalanceError(undefined);
    }
  };

  const maxAmount =
    maxRepayAmount && maxBalance && maxRepayAmount.lt(maxBalance)
      ? maxRepayAmount
      : maxBalance || maxRepayAmount;
  const onMaxValue = maxAmount
    ? () => {
        trade?.setDepositBalance(maxAmount, true);
        setCurrencyInput(maxAmount.toExactString(), false);
      }
    : undefined;

  return (
    <TransactionScreen
      actionPrefix="Repay"
      hasBackButton
      errorMessageOverride={balanceError}
      inputs={[
        <DepositInput
          ref={currencyInputRef}
          key="repay-input"
          inputLabel={defineMessage({
            defaultMessage: 'Repay',
          })}
          inputRef={currencyInputRef}
          depositTokens={trade?.availableTokens.deposit}
          onUpdate={onUpdate}
          onMaxValue={onMaxValue}
        />,
      ]}
    />
  );
});
