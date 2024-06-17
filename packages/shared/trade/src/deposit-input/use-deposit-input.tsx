import {
  useAccountReady,
  useWalletBalanceInputCheck,
  useExceedsSupplyCap,
} from '@notional-finance/notionable-hooks';
import { useState } from 'react';
import { MessageDescriptor } from 'react-intl';
import { useInputAmount } from '../common';
import { tradeErrors } from '../tradeErrors';
import { TokenBalance } from '@notional-finance/core-entities';
import { Network } from '@notional-finance/util';

export function useDepositInput(
  selectedNetwork: Network | undefined,
  depositSymbol?: string,
  isWithdraw?: boolean,
  useZeroDefault?: boolean,
  excludeSupplyCap = false
) {
  const [inputString, setInputString] = useState<string>('');
  const isAccountReady = useAccountReady(selectedNetwork);

  // eslint-disable-next-line prefer-const
  let { token, inputAmount } = useInputAmount(
    selectedNetwork,
    inputString,
    depositSymbol
  );

  if (useZeroDefault && token && inputAmount === undefined) {
    inputAmount = TokenBalance.zero(token);
  }

  const { maxBalanceString, maxBalance, insufficientBalance } =
    useWalletBalanceInputCheck(token, inputAmount);
  const supply = useExceedsSupplyCap(inputAmount, excludeSupplyCap);

  let errorMsg: MessageDescriptor | undefined;
  // Check that this is strictly true, when undefined it means the wallet data is
  // unknown or the input amount is undefined
  if (
    !isWithdraw &&
    isAccountReady &&
    depositSymbol === 'USDC' &&
    insufficientBalance === true &&
    selectedNetwork === Network.arbitrum
  ) {
    errorMsg = tradeErrors.usdcNotUSDCeMsg;
  } else if (!isWithdraw && isAccountReady && insufficientBalance === true) {
    errorMsg = tradeErrors.insufficientBalance;
  } else if (!excludeSupplyCap && supply?.willExceedCap) {
    errorMsg = {
      ...tradeErrors.exceedSupplyCap,
      values: { maxDeposit: supply.maxDeposit.toDisplayStringWithSymbol(2) },
    } as MessageDescriptor;
  }

  return {
    inputAmount: isWithdraw ? inputAmount?.neg() : inputAmount,
    maxBalance: isWithdraw ? undefined : maxBalance,
    // the onMaxValue callback is used instead of a string
    maxBalanceString: isWithdraw ? undefined : maxBalanceString,
    errorMsg,
    decimalPlaces: token?.decimals || 8,
    setInputString,
  };
}
