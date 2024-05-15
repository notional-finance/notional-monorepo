import {
  AccountDefinition,
  NOTERegistryClient,
  Registry,
  SNOTEWeightedPool,
  TokenBalance,
} from '@notional-finance/core-entities';
import { Network, filterEmpty } from '@notional-finance/util';
import { Observable, combineLatest, filter, map, switchMap } from 'rxjs';
import { BaseTradeState, NOTETradeType } from '../base-trade-store';
import { comparePortfolio } from './account-risk';

export function stakedNOTEPool(network$: Observable<Network>) {
  return network$.pipe(
    switchMap((n) => Registry.getOracleRegistry().subscribeNetworkKeys(n)),
    filter((s) => s?.key === NOTERegistryClient.sNOTEOracle),
    map(() => Registry.getExchangeRegistry().getSNOTEPool())
  );
}

export function initState(
  state$: Observable<BaseTradeState>,
  account$: Observable<AccountDefinition | null>,
  pool$: Observable<SNOTEWeightedPool | undefined>
) {
  return combineLatest([state$, account$, pool$]).pipe(
    filter(([{ isReady }]) => isReady === false),
    switchMap(async ([_, account, pool]) => {
      if (pool === undefined) return undefined;
      // TODO: maybe do this at the global level....
      const c = account
        ? await pool.getCoolDownStatus(account.address)
        : undefined;
      const sNOTE = Registry.getTokenRegistry().getTokenBySymbol(
        Network.mainnet,
        'sNOTE'
      );
      const NOTE = Registry.getTokenRegistry().getTokenBySymbol(
        Network.mainnet,
        'NOTE'
      );

      if (c?.inCoolDown) {
        return {
          isReady: true,
          tradeType: 'StakeNOTECoolDown' as NOTETradeType,
          selectedNetwork: Network.mainnet,
          ...c,
        };
      } else if (c?.inRedeemWindow) {
        return {
          isReady: true,
          tradeType: 'StakeNOTERedeem' as NOTETradeType,
          selectedNetwork: Network.mainnet,
          debt: sNOTE,
          deposit: NOTE,
          ...c,
        };
      } else {
        const ETH = Registry.getTokenRegistry().getTokenBySymbol(
          Network.mainnet,
          'ETH'
        );
        const WETH = Registry.getTokenRegistry().getTokenBySymbol(
          Network.mainnet,
          'WETH'
        );

        return {
          isReady: true,
          tradeType: 'StakeNOTE' as NOTETradeType,
          // Select ETH as default deposit token
          selectedDepositToken: 'ETH',
          availableDepositTokens: [ETH, WETH],
          deposit: ETH,
          // sNOTE is always the collateral
          availableCollateralTokens: [sNOTE],
          collateral: sNOTE,
          selectedNetwork: Network.mainnet,
          ...c,
        };
      }
    }),
    filterEmpty()
  );
}

export function calculateStake(
  state$: Observable<BaseTradeState>,
  pool$: Observable<SNOTEWeightedPool | undefined>
) {
  return combineLatest([state$, pool$]).pipe(
    filter(([{ isReady, tradeType }]) => isReady && tradeType === 'StakeNOTE'),
    map(([state, pool]) => {
      if (pool === undefined) return undefined;
      if (
        state.depositBalance === undefined ||
        state.secondaryDepositBalance === undefined
      )
        return undefined;

      const ETH = Registry.getTokenRegistry().getTokenBySymbol(
        Network.mainnet,
        'ETH'
      );

      const { lpTokens, feesPaid } = pool.getLPTokensGivenTokens([
        // Ensure that WETH is converted to ETH
        state.depositBalance.toToken(ETH),
        state.secondaryDepositBalance,
      ]);

      const collateralBalance = pool.getSNOTEForBPT(lpTokens);
      const feesPaidInETH = feesPaid.reduce(
        (s, t) => s.add(t.toToken(ETH)),
        TokenBalance.zero(ETH)
      );

      return {
        collateralBalance,
        collateralFee: feesPaidInETH,
        // Fees should already be deducted from collateralBalance
        netRealizedCollateralBalance: collateralBalance.toToken(ETH),
        canSubmit: true,
        postTradeBalances: [
          collateralBalance,
          state.depositBalance,
          state.secondaryDepositBalance,
        ],
      };
    }),
    filterEmpty()
  );
}

export function calculateUnstake(
  state$: Observable<BaseTradeState>,
  pool$: Observable<SNOTEWeightedPool | undefined>
) {
  return combineLatest([state$, pool$]).pipe(
    filter(
      ([{ isReady, tradeType }]) => isReady && tradeType === 'StakeNOTERedeem'
    ),
    map(([state, pool]) => {
      if (pool === undefined) return undefined;
      if (state.depositBalance === undefined) return undefined;
      const ETH = Registry.getTokenRegistry().getTokenBySymbol(
        Network.mainnet,
        'ETH'
      );

      let debtBalance: TokenBalance;
      let feesPaid: TokenBalance[];
      if (state.maxWithdraw && state.debtBalance) {
        debtBalance = state.debtBalance;
        const lpTokens = pool.getBPTForSNOTE(debtBalance);

        const { feesPaid: _f } = pool.getTokensOutGivenLPTokens(
          lpTokens,
          pool.NOTE_INDEX
        );
        feesPaid = _f;
        // const depositBalance = tokensOut[pool.NOTE_INDEX];
      } else {
        const { lpTokens, feesPaid: _f } = pool.getLPTokensRequiredForTokens([
          TokenBalance.zero(ETH),
          // This is the NOTE balance
          state.depositBalance.neg(),
        ]);
        debtBalance = pool.getSNOTEForBPT(lpTokens);
        feesPaid = _f;
      }

      const feesPaidInETH = feesPaid.reduce(
        (s, t) => s.add(t.toToken(ETH)),
        TokenBalance.zero(ETH)
      );

      return {
        debtBalance: debtBalance,
        debtFee: feesPaidInETH,
        netRealizedDebtBalance: debtBalance.toToken(state.depositBalance.token),
        canSubmit: true,
        postTradeBalances: [debtBalance, state.depositBalance],
      };
    }),
    filterEmpty()
  );
}

export function compareNOTEPortfolio(
  state$: Observable<BaseTradeState>,
  account$: Observable<AccountDefinition | null>
) {
  return combineLatest([state$, account$]).pipe(
    filter(([{ canSubmit }]) => canSubmit),
    map(([state, account]) => {
      const prior = account?.balances.filter(
        (t) =>
          t.symbol === state.deposit?.symbol ||
          t.symbol === state.secondaryDepositBalance?.symbol ||
          t.symbol === 'sNOTE'
      );
      return prior && state.postTradeBalances
        ? { comparePortfolio: comparePortfolio(prior, state.postTradeBalances) }
        : undefined;
    }),
    filterEmpty()
  );
}
