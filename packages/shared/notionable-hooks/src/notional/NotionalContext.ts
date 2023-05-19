import { GlobalState, initialGlobalState } from '@notional-finance/notionable';
import { createObservableContext } from '../observable-context/ObservableContext';

export const NotionalContext = createObservableContext<GlobalState>(
  'notional-global-context',
  initialGlobalState
);
