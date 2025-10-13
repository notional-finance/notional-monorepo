import {
  useReadOnlyAddress,
  useSubmitTxn,
  useTradeContext,
  useVaultPosition,
  useWalletStore,
} from '@notional-finance/notionable-hooks';
import { Network } from '@notional-finance/util';
import { useParams } from 'react-router-dom';
import { useCallback } from 'react';
import { ClaimRewards } from '@notional-finance/transaction';
import { observer } from 'mobx-react-lite';
import { TransactionScreen } from '../transaction-screen';
import { Box, useTheme } from '@mui/material';
import { TokenIcon } from '@notional-finance/icons';
import { CountUp, H4, Body } from '@notional-finance/mui';
import { defineMessage } from 'react-intl';

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
  useTradeContext('ManageVault');
  const { vaultAddress, selectedNetwork } = useParams<{
    vaultAddress: string;
    selectedNetwork: Network;
  }>();
  const theme = useTheme();

  const rewards = useVaultPosition(selectedNetwork, vaultAddress)?.vaultMetadata
    .rewardClaims;
  const rewardClaims = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(2),
        marginTop: theme.spacing(2),
      }}
    >
      {rewards?.map((claim) => {
        return (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing(1),
            }}
          >
            <TokenIcon symbol={claim.symbol} size="medium" />
            <H4>{claim.symbol}:</H4>
            <Body>
              <CountUp value={claim.toFloat()} decimals={4} />
            </Body>
          </Box>
        );
      })}
    </Box>
  );
  return (
    <TransactionScreen
      actionPrefix="Claim Rewards"
      submitText={defineMessage({
        defaultMessage: 'Claim Rewards',
      })}
      canSubmitOverride={claimRewards ? true : false}
      onSubmitOverride={claimRewards ? claimRewards : undefined}
      hasBackButton
      inputs={[rewardClaims]}
    />
  );
});
