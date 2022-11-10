import { useReducer } from 'react';

function reducer(state: any, action: Partial<any>) {
  return { ...state, ...action };
}

export function useFormState<T>(initial: T): [T, (update: Partial<T>) => void] {
  return useReducer(reducer, initial);
}
