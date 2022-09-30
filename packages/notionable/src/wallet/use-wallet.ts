import { TypedBigNumber } from '@notional-finance/sdk';
import { useObservableState } from 'observable-hooks';
import { initialWalletState, walletState$ } from './wallet-store';

export function useWallet() {
  const { tokens, walletConnected } = useObservableState(
    walletState$,
    initialWalletState
  );

  return {
    tokens,
    walletConnected,
  };
}

export function useWalletBalance() {
  const hiddenTokens = ['NOTE', 'WETH', 'sNOTE'];
  const { tokens } = useWallet();

  const enabledTokens = [...tokens.values()].filter((data) => {
    return data?.allowance.isPositive();
  });
  const supportedTokens = [...tokens.values()].filter((data) => {
    return !hiddenTokens.includes(data.symbol);
  });
  return { enabledTokens, supportedTokens };
}

export function useWalletBalanceInputCheck(
  symbol: string | undefined,
  inputAmount: TypedBigNumber | undefined
) {
  const { tokens } = useWallet();
  const maxBalance =
    symbol && tokens && tokens.has(symbol)
      ? tokens?.get(symbol)?.balance ??
        TypedBigNumber.fromBalance(0, symbol, false)
      : undefined;
  const allowance = symbol ? tokens?.get(symbol)?.allowance : undefined;
  const insufficientBalance =
    maxBalance &&
    inputAmount &&
    inputAmount.toExternalPrecision().gt(maxBalance);
  const insufficientAllowance =
    allowance && inputAmount && inputAmount.toExternalPrecision().gt(allowance);

  return {
    maxBalanceString: maxBalance?.toExactString(),
    maxBalance,
    insufficientBalance,
    insufficientAllowance,
  };
}

export function useTokenData(symbol: string) {
  const { tokens } = useWallet();
  const tokenData = tokens.get(symbol);
  const enabled = tokenData?.allowance.isPositive() ?? false;
  return { tokenData, enabled };
}
