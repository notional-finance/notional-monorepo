import { Box, useTheme } from '@mui/material';
import { MultiTokenIcon } from '@notional-finance/icons';
import { InfoTooltip, Body } from '@notional-finance/mui';

export const ClaimableRewards = ({
  rewardTokens,
  vaults,
}: {
  rewardTokens: string[];
  vaults: string[];
}) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(1),
        padding: theme.spacing(1.5),
        borderRadius: theme.spacing(6),
        backgroundColor: theme.palette.info.light,
      }}
    >
      <MultiTokenIcon symbols={rewardTokens} size={'medium'} shiftSize={8} />
      <Body main>Claimable Rewards</Body>
      <InfoTooltip
        iconColor={theme.palette.info.dark}
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
