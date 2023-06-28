import VaultView from './vault-view';
import {
  createVaultContext,
  useVaultContext,
} from '@notional-finance/notionable-hooks';

export const VaultActionContext = createVaultContext();

export const VaultActionProvider = () => {
  const value = useVaultContext();

  return (
    <VaultActionContext.Provider value={value}>
      <VaultView />
    </VaultActionContext.Provider>
  );
};

export default VaultActionProvider;
