import { logError } from '@notional-finance/utils';
import { useAccount, useNotional } from '@notional-finance/notionable-hooks';
import { TypedBigNumber } from '@notional-finance/sdk';
import { StakedNote, Treasury } from '@notional-finance/sdk/src/staking';
import { calculateNotePriceImpact } from '@notional-finance/stake-feature-shell/stake-action/stake-manager';
import { BigNumber, BigNumberish, ethers } from 'ethers';
import { useObservableState } from 'observable-hooks';
import {
  investNOTEAmount$,
  investNOTEError$,
  investWETHAmount$,
  investWETHError$,
  maxAmounts$,
  maxPriceImpact$,
  openLimitOrders$,
  tradeReserveAmount$,
  tradeReserveAmountError$,
  tradeReserveCurrentPrice$,
  tradeWETHAmount$,
  treasuryManager$,
} from './treasury-manager';
import { initialTreasuryState, treasuryState$, updateTreasuryState } from './treasury-store';

export function useTreasury() {
  const { notional } = useNotional();
  const openLimitOrders = useObservableState(openLimitOrders$);
  const { account, address: accountAddress } = useAccount();
  const treasuryManager = useObservableState(treasuryManager$);
  const {
    selectedReserveCurrency,
    tradeReserveStatus,
    cancelOrderId,
    tradePriceFloor,
    tradeSpotPrice,
  } = useObservableState(treasuryState$, initialTreasuryState);
  const tradeCurrentPrice = useObservableState(tradeReserveCurrentPrice$);
  const tradeReserveAmountError = useObservableState(tradeReserveAmountError$);
  const tradeReserveAmount = useObservableState(tradeReserveAmount$);
  const tradeWETHAmount = useObservableState(tradeWETHAmount$);
  const investNOTEAmount = useObservableState(investNOTEAmount$);
  const investWETHAmount = useObservableState(investWETHAmount$);
  const investNOTEError = useObservableState(investNOTEError$);
  const investWETHError = useObservableState(investWETHError$);
  const maxPriceImpact = useObservableState(maxPriceImpact$);
  const maxAmounts = useObservableState(maxAmounts$, {
    maxNOTEAmount: '',
    maxETHAmount: '',
    maxReserveAmount: '',
  });
  const { noteModifiedPriceUSD } = calculateNotePriceImpact(investNOTEAmount, investWETHAmount);
  const noteSpotPriceUSD = StakedNote.spotPriceToUSD(StakedNote.getSpotPrice()).toFloat();

  const tradeReserve = async () => {
    if (!notional) return;
    if (!account?.signer) return;
    if (!tradeReserveAmount) return;
    if (!tradeWETHAmount) return;

    const { chainId } = await notional.provider.getNetwork();
    try {
      const id = Number(chainId);
      const amount: BigNumberish =
        selectedReserveCurrency === 'COMP'
          ? (tradeReserveAmount as BigNumber)
          : (tradeReserveAmount as TypedBigNumber).n;
      await Treasury.submit0xLimitOrder(
        id,
        account.signer,
        selectedReserveCurrency,
        amount,
        tradeWETHAmount
      );

      updateTreasuryState({ tradeReserveStatus: 'Submitted' });
    } catch (e: unknown) {
      updateTreasuryState({ tradeReserveStatus: 'Error Submitting' });
      logError(e as Error, 'treasury.saga', 'tradeReserve');
    }
  };

  const harvestCOMP = async () => {
    if (!account) return;

    const compCurrencies = [1, 2, 3, 4];
    try {
      const populatedTxn = await Treasury.harvestCOMPFromNotional(compCurrencies);
      await account.sendTransaction(populatedTxn);
    } catch (e: unknown) {
      logError(e as Error, 'treasury.saga', 'harvestCOMP');
    }
  };

  const harvestReserves = async () => {
    if (!account) return;
    const reserveCurrencies = [1, 2, 3, 4];
    try {
      const populatedTxn = await Treasury.harvestAssetsFromNotional(reserveCurrencies);
      await account.sendTransaction(populatedTxn);
    } catch (e: unknown) {
      logError(e as Error, 'treasury.saga', 'harvestReserves');
    }
  };

  const fetchZeroExQuote = async () => {
    if (selectedReserveCurrency && tradeReserveAmount) {
      const resp = await fetch(
        `https://api.0x.org/swap/v1/quote?sellToken=${selectedReserveCurrency}&buyToken=WETH&sellAmount=${tradeReserveAmount.toString()}`
      );
      const jsonResp: { buyAmount: string } = await resp.json();
      updateTreasuryState({ inputTradeWETH: ethers.utils.formatUnits(jsonResp.buyAmount, 18) });
    }
  };

  const cancelOrder = async () => {
    if (!account) return;
    if (!openLimitOrders) return;

    try {
      const populatedTxn = await Treasury.cancelOrder(openLimitOrders[Number(cancelOrderId) - 1]);
      await account.sendTransaction(populatedTxn);
    } catch (e) {
      console.error(e);
    }
  };

  const investNOTE = async () => {
    if (!account || !investNOTEAmount || !investWETHAmount) return;
    try {
      const populatedTxn = await Treasury.investIntoStakedNOTE(investNOTEAmount, investWETHAmount);
      await account.sendTransaction(populatedTxn);
    } catch (e: unknown) {
      logError(e as Error, 'treasury.saga', 'investNOTE');
    }
  };

  const optimizeETH = () => {
    if (!investNOTEAmount) return;
    const optimalWETH = TypedBigNumber.fromBalance(
      StakedNote.getOptimumETHForNOTE(investNOTEAmount).n,
      'WETH',
      false
    );

    updateTreasuryState({ inputInvestETH: optimalWETH.toExactString() });
  };

  return {
    isTreasuryManager: treasuryManager === accountAddress,
    selectedReserveCurrency,
    tradeReserveStatus,
    tradePriceFloor,
    tradeSpotPrice,
    tradeReserveAmountError,
    tradeWETHAmount,
    tradeCurrentPrice,
    maxPriceImpact,
    noteModifiedPriceUSD,
    noteSpotPriceUSD,
    investNOTEError,
    investWETHError,
    maxAmounts,
    tradeReserve,
    harvestCOMP,
    harvestReserves,
    cancelOrder,
    fetchZeroExQuote,
    investNOTE,
    optimizeETH,
  };
}
