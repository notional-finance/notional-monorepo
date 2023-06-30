import { useObservableState } from 'observable-hooks';
import { errors$, reportNotionalError } from '@notional-finance/notionable';

export function useNotionalError() {
  const error = useObservableState(errors$);

  return {
    error,
    reportError: reportNotionalError,
  };
}
