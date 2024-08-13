import { BaseTradeState } from './base-trade/base-trade-store';
import { TokenDefinition } from '@notional-finance/core-entities';
import { RiskFactorKeys, RiskFactorLimit } from '@notional-finance/risk-engine';
import { NetworkLoadingState } from './global';
import { Network } from '@notional-finance/util';

export function isAppReady(
  networkState: Record<Network, NetworkLoadingState> | undefined
) {
  return (
    !!networkState &&
    Object.keys(networkState).every(
      (n) => networkState[n as Network] === 'Loaded'
    )
  );
}

export function isHashable(o: unknown): o is { hashKey: string } {
  return !!o && typeof o === 'object' && 'hashKey' in o;
}

export function getComparisonKey(
  arg: keyof BaseTradeState,
  s: Partial<BaseTradeState>
) {
  const val = s[arg];
  if (val === undefined) {
    return undefined;
  } else if (isHashable(val)) {
    return val.hashKey;
  } else if (arg === 'collateral' || arg === 'debt' || arg === 'deposit') {
    return (val as TokenDefinition).id;
  } else if (arg === 'riskFactorLimit') {
    const risk = val as RiskFactorLimit<RiskFactorKeys>;
    return `${risk?.riskFactor}:${
      isHashable(risk?.limit) ? risk?.limit.hashKey : risk?.limit.toString()
    }:${risk?.args?.map((t) => (typeof t === 'number' ? t : t?.id)).join(':')}`;
  } else {
    return val;
  }
}
