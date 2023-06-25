import { AccountFetchMode } from '@notional-finance/core-entities';
import { useNotionalContext, useTradeContext } from '../src';
import { Network } from '@notional-finance/util';
import { renderHook, act } from '@testing-library/react-hooks';
import { Wrapper } from './wrapper';

describe.withForkAndRegistry(
  {
    network: Network.ArbitrumOne,
    fetchMode: AccountFetchMode.SINGLE_ACCOUNT_DIRECT,
  },
  'Trade Context',
  () => {
    const renderTradeContext = async (trade: string) => {
      const r = renderHook(
        () => {
          const { globalState, globalState$, updateNotional } =
            useNotionalContext();
          const { state, state$, updateState } = useTradeContext(trade);
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

      await r.waitFor(() => {
        return (
          r.result.current.globalState.isNetworkReady &&
          r.result.current.state.isReady
        );
      });

      return r;
    };

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
