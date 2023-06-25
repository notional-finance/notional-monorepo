import { AccountFetchMode } from '@notional-finance/core-entities';
import { TradeContext, createTradeContext, useTradeContext } from '../src';
import { Network } from '@notional-finance/util';
import { renderHook, act } from '@testing-library/react-hooks';
import { BrowserRouter } from 'react-router-dom';
import { QueryParamProvider } from 'use-query-params';
import { ReactRouter5Adapter } from 'use-query-params/adapters/react-router-5';

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      <QueryParamProvider adapter={ReactRouter5Adapter}>
        {children}
      </QueryParamProvider>
    </BrowserRouter>
  );
};

describe.withForkAndRegistry(
  {
    network: Network.ArbitrumOne,
    fetchMode: AccountFetchMode.SINGLE_ACCOUNT_DIRECT,
  },
  'Trade Context',
  () => {
    it('loads a trade context', () => {
      const { result } = renderHook(() => useTradeContext('MintNToken'), {
        wrapper: Wrapper,
      });

      expect(result.current.updateState).toBeDefined();
      expect(result.current.state).toBeDefined();
      expect(result.current.state$).toBeDefined();
    });
  }
);
