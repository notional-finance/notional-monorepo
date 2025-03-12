import { Box, useTheme } from '@mui/material';
import { MultiTokenIcon } from '@notional-finance/icons';
import { InfoTooltip, Body } from '@notional-finance/mui';
import { useSelectedNetwork } from '@notional-finance/notionable-hooks';
import { useVaultHoldings } from '@notional-finance/notionable-hooks';
import { FormattedMessage } from 'react-intl';

const useClaimableIncentives = () => {
  const network = useSelectedNetwork();
  const vaults = useVaultHoldings(network);
  const { rewardTokens, vaults: vaultsList } = (vaults || []).reduce(
    (acc, vault) => {
      if (
        vault.vaultMetadata.rewardClaims &&
        vault.vaultMetadata.rewardClaims.length > 0
      ) {
        vault.vaultMetadata.rewardClaims.forEach((claim) => {
          acc.rewardTokens.add(claim.symbol);
        });
        acc.vaults.push(vault.name);
      }
      return acc;
    },
    { rewardTokens: new Set<string>(), vaults: [] as string[] }
  );
  return { rewardTokens: Array.from(rewardTokens), vaults: vaultsList };
};

export const ClaimableIncentives = () => {
  const theme = useTheme();
  const { rewardTokens, vaults } = useClaimableIncentives();
  if (rewardTokens.length === 0) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(1),
        padding: theme.spacing(1),
        borderRadius: theme.spacing(6),
        backgroundColor: theme.palette.pending.light,
      }}
    >
      <MultiTokenIcon symbols={rewardTokens} size={'medium'} shiftSize={8} />
      <Body main>
        <FormattedMessage defaultMessage="Claimable Rewards" />
      </Body>
      <InfoTooltip
        iconColor={theme.palette.pending.main}
        iconSize={theme.spacing(2)}
        ToolTipComp={() => (
          <Box>
            {vaults.map((v) => (
              <Body key={v}>{v}</Body>
            ))}
          </Box>
        )}
      />
    </Box>
  );
};
