import { useAccount } from '@notional-finance/notionable-hooks';
import { StakedNote } from '@notional-finance/sdk/src/staking';
import { TradePropertyKeys } from '@notional-finance/trade';
import { messages } from '../messages';
import { useStakeAction } from './use-stake-action';

export const useStakeTransaction = () => {
  const { account } = useAccount();
  const { noteAmount, ethAmount, ethOrWeth, priceImpact } = useStakeAction();
  if (!account) return undefined;

  return {
    buildTransactionCall: {
      transactionFn: ethOrWeth === 'ETH' ? StakedNote.mintFromETH : StakedNote.mintFromWETH,
      transactionArgs: [noteAmount, ethAmount, account.address],
    },
    transactionHeader: messages.stake.heading,
    transactionProperties: {
      [TradePropertyKeys.noteDeposit]: noteAmount,
      [TradePropertyKeys.ethDeposit]: ethAmount,
      [TradePropertyKeys.notePrice]: priceImpact?.noteModifiedPriceUSD,
    },
  };
};
