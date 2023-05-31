import { AccountFetchMode } from '@notional-finance/core-entities';
import {
  BaseTradeState,
  GlobalState,
  initialBaseTradeState,
  initialGlobalState,
  loadBaseTradeManager,
  makeStore,
} from '../src';
import { Network } from '@notional-finance/util';
import { calculateCollateral } from '@notional-finance/transaction';
import { getSequencer } from './test-utils.spec';

describe.withForkAndRegistry(
  {
    network: Network.ArbitrumOne,
    fetchMode: AccountFetchMode.SINGLE_ACCOUNT_DIRECT,
  },
  'Base Trade Manager',
  () => {
    const {
      updateState,
      _state$: state$,
      _store: stateStore,
    } = makeStore<BaseTradeState>(initialBaseTradeState);
    const {
      updateState: updateGlobal,
      _state$: global$,
      _store: globalStore,
    } = makeStore<GlobalState>(initialGlobalState);

    const baseTradeUpdates = loadBaseTradeManager(state$, global$, {
      calculationFn: calculateCollateral,
      requiredArgs: ['depositBalance', 'collateralPool'],
    });

    const testSequence = getSequencer(updateState, baseTradeUpdates);

    it('it sets initial tokens on ready', (done) => {
      baseTradeUpdates.subscribe((s) => {
        if (s.isReady) {
          expect(s.availableCollateralTokens?.length).toBeGreaterThan(5);
          expect(s.availableDebtTokens?.length).toBeGreaterThan(5);
          expect(s.availableDepositTokens?.length).toBeGreaterThan(5);
          done();
        }
      });

      updateGlobal({
        selectedNetwork: Network.ArbitrumOne,
        isNetworkReady: true,
      });
    });
    // it('it returns prior account risk', () => {});
    // it('it sets selected tokens and balances', () => {});
    // it('it sets can submit once all required inputs are available', () => {});
    // it('it calculates account risk when the account is available', () => {});
  }
);
