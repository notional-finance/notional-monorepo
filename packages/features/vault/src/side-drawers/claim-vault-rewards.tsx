import {
  useNotionalContext,
  useTransactionStatus,
  useVaultPosition,
  useWalletAddress,
} from '@notional-finance/notionable-hooks';
import { useCallback, useContext } from 'react';
import { VaultActionContext } from '../vault';
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

export const ClaimVaultRewards = () => {
  const context = useContext(VaultActionContext);
  const {
    updateNotional,
    globalState: { networkAccounts },
  } = useNotionalContext();
  const {
    state: { vaultAddress, selectedNetwork },
  } = context;
  const navigate = useNavigate();
  const vaultPosition = useVaultPosition(selectedNetwork, vaultAddress);
  const account = useWalletAddress();
  const { mustSwitchNetwork } = useChangeNetwork(selectedNetwork);
  const { isReadOnlyAddress, onSubmit } = useTransactionStatus(
    selectedNetwork,
    () => {
      if (selectedNetwork && networkAccounts) {
        // NOTE: this is a bit of a hack to clear the rewardClaims from the vaultHoldings
        // so that the backend will refresh the vaultHoldings with the new rewardClaims
        const clearedRewardClaims = {
          ...networkAccounts,
          [selectedNetwork]: {
            ...networkAccounts[selectedNetwork],
            vaultHoldings: networkAccounts[selectedNetwork]?.vaultHoldings?.map(
              (holding) =>
                holding.vault.vaultAddress === vaultAddress
                  ? {
                      ...holding,
                      vaultMetadata: {
                        ...holding.vaultMetadata,
                        rewardClaims: undefined,
                      },
                    }
                  : holding
            ),
          },
        };

        updateNotional({ networkAccounts: clearedRewardClaims });
      }
    }
  );

  const handleSubmit = useCallback(async () => {
    if (!isReadOnlyAddress && vaultAddress && account) {
      const contract = new Contract(
        vaultAddress,
        ISingleSidedLPStrategyVaultABI
      ) as ISingleSidedLPStrategyVault;
      const populatedTxn =
        await contract.populateTransaction.claimAccountRewards(account);
      onSubmit('Claim Vault Rewards', populatedTxn);
    }
  }, [isReadOnlyAddress, onSubmit, vaultAddress, account]);

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
      canSubmit={!mustSwitchNetwork && !isReadOnlyAddress}
      handleSubmit={handleSubmit}
    >
      <ScrollToTop />
      {mustSwitchNetwork && (
        <SwitchNetwork
          context={context}
          hideDrawer
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
};
