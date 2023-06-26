import { AccountFetchMode } from '@notional-finance/core-entities';
import { useNotionalContext, useVaultContext } from '../src';
import { Network } from '@notional-finance/util';
import { renderHook, act } from '@testing-library/react-hooks';
import { Wrapper } from './wrapper';
import { VaultTradeType } from '@notional-finance/notionable';

describe.withForkAndRegistry(
  {
    network: Network.ArbitrumOne,
    fetchMode: AccountFetchMode.SINGLE_ACCOUNT_DIRECT,
  },
  'Vault Context',
  () => {
    const vaultAddress = '0xae38f4b960f44d86e798f36a374a1ac3f2d859fa';
    const renderTradeContext = async (tradeType: VaultTradeType) => {
      const r = renderHook(
        () => {
          const { globalState, globalState$, updateNotional } =
            useNotionalContext();
          const { state, state$, updateState } = useVaultContext();
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
        r.result.current.updateState({ tradeType, vaultAddress });
      });

      await r.waitFor(() => {
        return (
          r.result.current.globalState.isNetworkReady &&
          r.result.current.state.isReady
        );
      });

      return r;
    };

    describe('Create Vault Position', () => {
      it('properly filters currencies', async () => {
        const { result, waitForNextUpdate } = await renderTradeContext(
          'CreateVaultPosition'
        );

        await waitForNextUpdate();

        console.log(result.current.state);
        expect(result.current.state.selectedCollateralToken).toBe('nUSDC');
      });
    });
  }
);
