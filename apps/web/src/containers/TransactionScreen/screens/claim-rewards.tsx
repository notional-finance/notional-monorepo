import {
  useReadOnlyAddress,
  useSubmitTxn,
  useVaultPosition,
  useWalletStore,
} from '@notional-finance/notionable-hooks';
import { Network } from '@notional-finance/util';
import { useParams } from 'react-router-dom';
import { useCallback, useEffect } from 'react';
import { ClaimRewards } from '@notional-finance/transaction';
import { observer } from 'mobx-react-lite';
import { VaultManageScreen } from './manage';

export const useClaimRewards = () => {
  const submitTxn = useSubmitTxn();
  const { userWallet } = useWalletStore();
  const isReadOnlyAddress = useReadOnlyAddress();
  const { vaultAddress, selectedNetwork } = useParams<{
    vaultAddress: string;
    selectedNetwork: Network;
  }>();
  const position = useVaultPosition(selectedNetwork, vaultAddress);

  const claimRewards = useCallback(() => {
    if (isReadOnlyAddress) return;
    if (userWallet && selectedNetwork && position && vaultAddress) {
      ClaimRewards({
        address: userWallet.selectedAddress,
        network: selectedNetwork,
        lendingRouter: position?.vaultDebt.token.address,
        vaultAddress: vaultAddress,
      }).then((populatedTx) => {
        submitTxn('ClaimRewards', populatedTx);
      });
    }
  }, [
    userWallet,
    submitTxn,
    isReadOnlyAddress,
    selectedNetwork,
    position,
    vaultAddress,
  ]);

  if (!position || position.vaultMetadata.rewardClaims.length === 0)
    return undefined;

  return claimRewards;
};

export const VaultClaimRewards = observer(() => {
  const claimRewards = useClaimRewards();
  useEffect(() => {
    if (claimRewards) claimRewards();
  }, [claimRewards]);

  return <VaultManageScreen />;
});
