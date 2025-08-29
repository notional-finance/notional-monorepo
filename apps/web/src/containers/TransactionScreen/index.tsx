import {
  useAccountReady,
  useSelectedNetwork,
  useVaultPosition,
  useWalletConnected,
} from '@notional-finance/notionable-hooks';
import { observer } from 'mobx-react-lite';
import { useParams } from 'react-router-dom';
import { Routes, Route } from 'react-router-dom';
import { FeatureLoader } from '@notional-finance/shared-web';
import {
  VaultCreateScreen,
  VaultIncreaseScreen,
  VaultInstantWithdraw,
  VaultManageScreen,
  VaultSmartWithdraw,
  VaultPendingWithdraw,
  VaultFinalizeWithdraw,
} from './screens';

export const VaultDefaultScreen = observer(() => {
  const selectedNetwork = useSelectedNetwork();
  const { vaultAddress } = useParams<{
    vaultAddress?: string;
  }>();
  const isWalletConnected = useWalletConnected();
  const isAccountReady = useAccountReady(selectedNetwork);
  // TODO: this is a little late from use account ready
  const vaultPosition = useVaultPosition(selectedNetwork, vaultAddress);
  const manageScreen = vaultPosition?.hasPendingWithdraw ? (
    <VaultPendingWithdraw />
  ) : vaultPosition ? (
    <VaultManageScreen />
  ) : (
    <VaultCreateScreen />
  );

  return (
    <FeatureLoader
      featureLoaded={
        !isWalletConnected || (isWalletConnected && isAccountReady)
      }
    >
      <Routes>
        <Route path="" element={manageScreen} />
        <Route path="manage" element={manageScreen} />
        <Route path="increase" element={<VaultIncreaseScreen />} />
        <Route path="instant-withdraw" element={<VaultInstantWithdraw />} />
        <Route path="smart-withdraw" element={<VaultSmartWithdraw />} />
        <Route path="pending-withdraw" element={<VaultPendingWithdraw />} />
        <Route path="finalize-withdraw" element={<VaultFinalizeWithdraw />} />
      </Routes>
    </FeatureLoader>
  );
});
