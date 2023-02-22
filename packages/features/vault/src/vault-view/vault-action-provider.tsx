import {
  initialVaultActionState,
  loadVaultActionManager,
  VaultActionState,
} from '@notional-finance/notionable';
import {
  useObservableContext,
  createObservableContext,
} from '@notional-finance/notionable-hooks';
import VaultView from './vault-view';

export const VaultActionContext = createObservableContext<VaultActionState>(
  'vault-action-context',
  initialVaultActionState
);

export const VaultActionProvider = () => {
  const value = useObservableContext(
    initialVaultActionState,
    {},
    loadVaultActionManager
  );

  return (
    <VaultActionContext.Provider value={value}>
      <VaultView />
    </VaultActionContext.Provider>
  );
};

export default VaultActionProvider;
