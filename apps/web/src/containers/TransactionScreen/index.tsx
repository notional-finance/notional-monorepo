import {
  useAccountReady,
  useSelectedNetwork,
  useVaultPosition,
} from '@notional-finance/notionable-hooks';
import { observer } from 'mobx-react-lite';
import { useParams } from 'react-router-dom';
import { FeatureLoader } from '@notional-finance/shared-web';
import { VaultCreateScreen, VaultManageScreen } from './screens';

export const VaultDefaultScreen = observer(() => {
  const selectedNetwork = useSelectedNetwork();
  const { vaultAddress } = useParams<{
    vaultAddress?: string;
  }>();
  const isAccountReady = useAccountReady(selectedNetwork);
  // TODO: this is a little late from use account ready
  const vaultPosition = useVaultPosition(selectedNetwork, vaultAddress);

  return (
    <FeatureLoader featureLoaded={isAccountReady === true}>
      {vaultPosition ? <VaultManageScreen /> : <VaultCreateScreen />}
    </FeatureLoader>
  );
});
