import { AccountFetchMode } from '@notional-finance/core-entities';
import { useNotionalContext, useTradeContext } from '../src';
import { Network } from '@notional-finance/util';
import { renderHook, act } from '@testing-library/react-hooks';
import { Wrapper } from './wrapper';
import { TradeType } from '@notional-finance/notionable';

describe.withForkAndRegistry(
  {
    network: Network.ArbitrumOne,
    fetchMode: AccountFetchMode.SINGLE_ACCOUNT_DIRECT,
  },
  'Trade Context',
  () => {
    const renderTradeContext = async (tradeType: TradeType) => {
      const r = renderHook(
        () => {
          const { globalState, globalState$, updateNotional } =
            useNotionalContext();
          const { state, state$, updateState } = useTradeContext();
          return {
            state,
            updateState,
            state$,
            globalState,
            globalState$,
            updateNotional,
          };
        },
        {
          wrapper: Wrapper,
        }
      );

      act(() => {
        r.result.current.updateState({ tradeType });
      });

      await r.waitFor(() => {
        return (
          r.result.current.globalState.isNetworkReady &&
          r.result.current.state.isReady
        );
      });

      return r;
    };

    it('properly clears state on trade type change', async () => {
      const { result, waitForNextUpdate } = await renderTradeContext(
        'MintNToken'
      );
      act(() => {
        result.current.updateState({ selectedDepositToken: 'USDC' });
      });

      await waitForNextUpdate();

      expect(result.current.state.selectedCollateralToken).toBe('nUSDC');
      expect(result.current.state.tradeType).toBe('MintNToken');

      act(() => {
        result.current.updateState({ tradeType: 'LendFixed' });
      });

      await waitForNextUpdate();

      expect(result.current.state.selectedCollateralToken).toBeUndefined();
      expect(result.current.state.selectedDepositToken).toBeUndefined();
      expect(result.current.state.tradeType).toBe('LendFixed');
    });

    describe('Mint nToken', () => {
      it('properly filters currencies', async () => {
        const { result, waitForNextUpdate } = await renderTradeContext(
          'MintNToken'
        );

        act(() => {
          result.current.updateState({ selectedDepositToken: 'USDC' });
        });

        await waitForNextUpdate();

        expect(result.current.state.selectedCollateralToken).toBe('nUSDC');
      });
    });

    describe('Lend Fixed', () => {
      it('properly filters currencies', async () => {
        const { result, waitForNextUpdate } = await renderTradeContext(
          'LendFixed'
        );

        act(() => {
          result.current.updateState({ selectedDepositToken: 'USDC' });
        });

        await waitForNextUpdate();

        expect(result.current.state.availableCollateralTokens).toHaveLength(2);
      });
    });
  }
);
