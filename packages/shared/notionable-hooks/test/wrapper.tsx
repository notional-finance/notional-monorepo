import { BrowserRouter } from 'react-router-dom';
import { QueryParamProvider } from 'use-query-params';
import { ReactRouter5Adapter } from 'use-query-params/adapters/react-router-5';
import { useEffect } from 'react';
import { NotionalContext, useGlobalContext } from '../src';
import { Network } from '@notional-finance/util';

export const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const globalState = useGlobalContext();

  const { updateState } = globalState;
  useEffect(() => {
    updateState({
      selectedNetwork: Network.ArbitrumOne,
    });
  }, [updateState]);

  return (
    <BrowserRouter>
      <QueryParamProvider adapter={ReactRouter5Adapter}>
        <NotionalContext.Provider value={globalState}>
          {children}
        </NotionalContext.Provider>
      </QueryParamProvider>
    </BrowserRouter>
  );
};
