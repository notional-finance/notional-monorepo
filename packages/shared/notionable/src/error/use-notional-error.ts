import { useObservableState } from 'observable-hooks';
import { errors$, reportError } from './error-manager';

export function useNotionalError() {
  const error = useObservableState(errors$);

  return {
    error,
    reportError,
  };
}
