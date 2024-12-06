import {
  useCurrentNetworkAccount,
  useCurrentTradeContext,
  useVaultPosition,
  useWalletAddress,
  useWalletStore,
} from '@notional-finance/notionable-hooks';
import { useCallback } from 'react';
import {
  ActionSidebar,
  DataTable,
  ScrollToTop,
  TABLE_VARIANTS,
} from '@notional-finance/mui';
import { defineMessage, FormattedMessage } from 'react-intl';
import { SwitchNetwork, useChangeNetwork } from '@notional-finance/trade';
import { useNavigate } from 'react-router-dom';
import {
  ISingleSidedLPStrategyVault,
  ISingleSidedLPStrategyVaultABI,
} from '@notional-finance/contracts';
import { Contract } from 'ethers';
import { observer } from 'mobx-react-lite';
import { useConnectWallet } from '@web3-onboard/react';

export const ClaimVaultRewards = observer(() => {
  const trade = useCurrentTradeContext();
  const vaultAddress = trade?.vaultAddress;
  const selectedNetwork = trade?.selectedNetwork;

  const navigate = useNavigate();
  const [{ wallet }] = useConnectWallet();
  const vaultPosition = useVaultPosition(selectedNetwork, vaultAddress);
  const account = useWalletAddress();
  const networkAccount = useCurrentNetworkAccount();
  const { mustSwitchNetwork } = useChangeNetwork(selectedNetwork);

  const clearRewardClaims = useCallback(() => {
    if (vaultAddress && networkAccount) {
      networkAccount.refreshRewardClaims(vaultAddress);
    }
  }, [vaultAddress, networkAccount]);

  const { userWallet, submitTxn } = useWalletStore();

  const handleSubmit = useCallback(async () => {
    if (!userWallet?.isReadOnlyAddress && vaultAddress && account && wallet) {
      const contract = new Contract(
        vaultAddress,
        ISingleSidedLPStrategyVaultABI
      ) as ISingleSidedLPStrategyVault;
      const populatedTxn =
        await contract.populateTransaction.claimAccountRewards(account);
      submitTxn('Claim Vault Rewards', populatedTxn, wallet, clearRewardClaims);
    }
  }, [
    userWallet?.isReadOnlyAddress,
    submitTxn,
    vaultAddress,
    account,
    clearRewardClaims,
    wallet,
  ]);

  const tableData =
    vaultPosition?.vaultMetadata.rewardClaims?.map((a) => ({
      token: a.symbol,
      amount: a.toDisplayStringWithSymbol(3, false),
    })) || [];

  return (
    <ActionSidebar
      heading={defineMessage({
        defaultMessage: 'Claim Vault Rewards',
      })}
      helptext={defineMessage({
        defaultMessage: 'Claim the rewards earned from your vault.',
      })}
      canSubmit={!mustSwitchNetwork && !userWallet?.isReadOnlyAddress}
      handleSubmit={handleSubmit}
      onCancelCallback={() => {
        navigate(-1);
      }}
    >
      <ScrollToTop />
      {mustSwitchNetwork && (
        <SwitchNetwork
          hideDrawer
          selectedNetwork={selectedNetwork}
          onCancel={() => {
            navigate(-1);
          }}
        />
      )}
      <DataTable
        tableVariant={TABLE_VARIANTS.MINI}
        tableTitle={<FormattedMessage defaultMessage={'Rewards to Claim'} />}
        data={tableData}
        columns={[
          {
            header: <FormattedMessage defaultMessage={'Token'} />,
            accessorKey: 'token',
            textAlign: 'left',
          },
          {
            header: <FormattedMessage defaultMessage={'Amount'} />,
            accessorKey: 'amount',
            textAlign: 'right',
          },
        ]}
      />
    </ActionSidebar>
  );
});
