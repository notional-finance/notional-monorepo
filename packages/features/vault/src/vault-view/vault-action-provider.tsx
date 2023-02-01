import { initialVaultActionState, VaultActionContext } from '../managers';
import { loadVaultActionManager } from '../managers';
import { useObservableContext } from '@notional-finance/notionable-hooks';
import VaultView from './vault-view';

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
