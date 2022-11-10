import { useQueryParams } from '@notional-finance/utils';
import { useAccount, useNotional } from '@notional-finance/notionable-hooks';
import { useLiquidity } from './use-liquidity';
import { TradeProperties, TradePropertyKeys } from '@notional-finance/trade';

export const useLiquidityTransaction = () => {
  const { account } = useAccount();
  const { notional } = useNotional();
  const { inputAmount, selectedToken, nTokensMinted, totalYield } = useLiquidity();
  const { confirm } = useQueryParams();

  const confirmRoute = !!confirm;

  if (account && notional && confirmRoute && inputAmount) {
    const transactionProperties: TradeProperties = {
      [TradePropertyKeys.deposit]: inputAmount,
      [TradePropertyKeys.nTokensMinted]: nTokensMinted,
      [TradePropertyKeys.apy]: totalYield,
    };

    return {
      buildTransactionCall: {
        transactionFn: notional.mintNToken,
        transactionArgs: [
          account.address,
          selectedToken,
          inputAmount?.toExternalPrecision(),
          false,
        ],
      },
      transactionHeader: '',
      transactionProperties: transactionProperties,
    };
  }

  return undefined;
};
