import { VaultConfig, VaultReturn, VaultState } from '@notional-finance/sdk';
import { Observable } from 'rxjs';
import { makeStore } from '../utils';

export interface ListedVault {
  vaultConfig: VaultConfig;
  underlyingSymbol: string;
  strategyName: string;
}

export interface VaultPerformance {
  historicalReturns: VaultReturn[];
  sevenDayTotalAverage: number;
  thirtyDayTotalAverage: number;
  sevenDayReturnDrivers: {
    source: string;
    avg: number;
  }[];
  thirtyDayReturnDrivers: {
    source: string;
    avg: number;
  }[];
}

export interface VaultStore {
  listedVaults: ListedVault[];
  vaultMaturityStates: Map<string, VaultState[]>;
  activeVaultMarkets: Map<string, string[]>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  baseVaultInitParams: Map<string, any>;
}

export const initialVaultState: VaultStore = {
  listedVaults: [],
  vaultMaturityStates: new Map(),
  activeVaultMarkets: new Map(),
  baseVaultInitParams: new Map(),
};

const {
  updateState: updateVaultState,
  _state$: vaultState$,
  selectState: selectVaultState,
} = makeStore<VaultStore>(initialVaultState);

export { updateVaultState, selectVaultState, vaultState$ };

export const listedVaults$ = selectVaultState('listedVaults') as Observable<
  ListedVault[]
>;
export const activeVaultMarkets$ = selectVaultState(
  'activeVaultMarkets'
) as Observable<Map<string, string[]>>;
