import {
  AccountFetchMode,
  Registry,
  TokenDefinition,
} from '@notional-finance/core-entities';
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
import { withLatestFrom } from 'rxjs';

describe.withForkAndRegistry(
  {
    network: Network.ArbitrumOne,
    fetchMode: AccountFetchMode.SINGLE_ACCOUNT_DIRECT,
  },
  'Base Trade Manager',
  () => {
    const { updateState, _state$: state$ } = makeStore<BaseTradeState>(
      initialBaseTradeState
    );
    const { updateState: updateGlobal, _state$: global$ } =
      makeStore<GlobalState>(initialGlobalState);

    const baseTradeUpdates = loadBaseTradeManager(
      state$,
      global$,
      {
        calculationFn: calculateCollateral,
        requiredArgs: ['collateral', 'depositBalance', 'collateralPool'],
      },
      {
        debtFilter: (t: TokenDefinition) => t.currencyId === 3,
        collateralFilter: (t: TokenDefinition) => t.currencyId === 3,
        depositFilter: (t: TokenDefinition) =>
          t.currencyId === 3 && t.tokenType === 'Underlying',
      }
    );

    it('it sets initial tokens on ready', (done) => {
      baseTradeUpdates.subscribe((s) => {
        if (s.isReady) {
          expect(s.availableCollateralTokens?.length).toBeGreaterThan(0);
          expect(s.availableDebtTokens?.length).toBeGreaterThan(0);
          expect(s.availableDepositTokens?.length).toBeGreaterThan(0);
          done();
        }
      });

      updateGlobal({
        selectedNetwork: Network.ArbitrumOne,
        isNetworkReady: true,
      });
    });

    it('it resets to initial state on network change', (done) => {
      let isReady = false;
      baseTradeUpdates.pipe(withLatestFrom(global$)).subscribe(([s, g]) => {
        if (s.isReady) {
          isReady = true;
        }

        if (isReady && s.isReady === false) {
          // isReady is cleared to false on network switch
          expect(g.selectedNetwork).toBe(Network.Mainnet);
          done();
        }
      });

      updateGlobal({
        selectedNetwork: Network.ArbitrumOne,
        isNetworkReady: true,
      });

      updateGlobal({
        selectedNetwork: Network.Mainnet,
        isNetworkReady: false,
      });
    });

    it('it returns prior account risk', (done) => {
      updateGlobal({
        selectedNetwork: Network.ArbitrumOne,
        isNetworkReady: true,
      });

      Registry.getAccountRegistry().onAccountReady(
        Network.ArbitrumOne,
        '0xd74e7325dfab7d7d1ecbf22e6e6874061c50f243',
        () => {
          updateGlobal({
            selectedAccount: '0xd74e7325dfab7d7d1ecbf22e6e6874061c50f243',
            isAccountReady: true,
            isAccountPending: false,
          });

          baseTradeUpdates.pipe(withLatestFrom(global$)).subscribe(([s, g]) => {
            if (s.priorAccountRisk !== undefined) {
              expect(g.selectedAccount).toBeDefined();
              expect(g.isAccountReady).toBeTruthy();
              done();
            }
          });
        }
      );
    });

    describe('Test Sequences', () => {
      const testSequence = getSequencer(updateState, baseTradeUpdates);
      baseTradeUpdates.subscribe((s) => {
        updateState(s);
      });

      beforeAll((done) => {
        state$.subscribe((s) => {
          if (s.isReady) done();
        });

        updateGlobal({
          selectedNetwork: Network.ArbitrumOne,
          isNetworkReady: true,
        });
      });

      it('it sets selected tokens and balances', async () => {
        testSequence([
          [
            { selectedCollateralToken: 'nUSDC' },
            (s) => {
              expect(s.collateral?.symbol).toBe('nUSDC');
            },
          ],
          [
            { selectedDepositToken: 'USDC' },
            (s) => {
              expect(s.deposit?.symbol).toBe('USDC');
            },
          ],
          [
            { depositInputAmount: { amount: '5', inUnderlying: true } },
            (s) => {
              expect(s.depositBalance?.toDisplayStringWithSymbol(1)).toEqual(
                '5.0 USDC'
              );
              expect(s.canSubmit).toBeTruthy();
              expect(s.collateralBalance?.toUnderlying()).toBeApprox(
                s.depositBalance
              );
              expect(s.collateralFee?.toFloat()).toBe(0);
            },
          ],
          [
            { depositInputAmount: { amount: '10', inUnderlying: true } },
            (s) => {
              expect(s.depositBalance?.toDisplayStringWithSymbol(1)).toEqual(
                '10.0 USDC'
              );
              expect(s.canSubmit).toBeTruthy();
              expect(s.collateralBalance?.toUnderlying()).toBeApprox(
                s.depositBalance
              );
              expect(s.collateralFee?.toFloat()).toBe(0);
            },
          ],
          [
            { depositInputAmount: undefined },
            (s) => {
              expect(s.depositBalance).toBeUndefined();
              expect(s.canSubmit).toBe(false);
              expect(s.collateralBalance).toBeUndefined();
              expect(s.collateralFee).toBeUndefined();
            },
          ],
          [
            { depositInputAmount: { amount: '15', inUnderlying: true } },
            (s) => {
              expect(s.depositBalance?.toDisplayStringWithSymbol(1)).toEqual(
                '15.0 USDC'
              );
              expect(s.canSubmit).toBeTruthy();
              expect(s.collateralBalance?.toUnderlying()).toBeApprox(
                s.depositBalance
              );
              expect(s.collateralFee?.toFloat()).toBe(0);
            },
          ],
        ]);
      });

      it.only('it parses risk factors', () => {
        testSequence([
          [
            {
              selectedRiskFactor: 'loanToValue',
              selectedRiskLimit: { value: 60 },
            },
            (s) => {
              console.log(s.riskFactorLimit);
            },
          ],
        ]);
      });

      // it('it calculates account risk when the account is available', () => {});
    });
  }
);
