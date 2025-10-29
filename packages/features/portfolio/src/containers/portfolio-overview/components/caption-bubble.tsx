import { Box, useTheme } from '@mui/material';
import { TokenBalance } from '@notional-finance/core-entities';
import {
  CheckmarkIcon,
  ClockIcon,
  LockIcon,
  TokenIcon,
  HourglassIcon,
} from '@notional-finance/icons';
import { Caption } from '@notional-finance/mui';

const CaptionBubble = ({
  caption,
  icon,
}: {
  caption: React.ReactNode;
  icon: React.ReactNode;
}) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: 'flex',
        gap: theme.spacing(1),
        alignItems: 'center',
        marginTop: theme.spacing(0.5),
        backgroundColor: theme.palette.info.light,
        padding: theme.spacing(0.25, 1, 0.25, 0.25),
        borderRadius: theme.shape.borderRadiusLarge,
      }}
    >
      <Box sx={{ display: 'flex' }}>{icon}</Box>
      <Caption main>{caption}</Caption>
    </Box>
  );
};

export const RewardClaimCaptionBubble = ({
  rewardClaims,
}: {
  rewardClaims: TokenBalance[];
}) => {
  if (rewardClaims.filter((c) => c !== undefined).length === 0) return null;
  return (
    <CaptionBubble
      caption="Claim Rewards"
      icon={
        <Box
          sx={{
            display: 'flex',
            width: `${8 + rewardClaims.length * 8}px`, // 8px base + 8px per icon (overlapping)
          }}
        >
          {rewardClaims.map((claim, index) => (
            <Box
              key={claim.symbol}
              sx={{
                marginLeft: index > 0 ? '-8px' : 0, // Overlap by 8px for each subsequent icon
                zIndex: rewardClaims.length - index, // Stack icons properly
                position: 'relative',
              }}
            >
              <TokenIcon symbol={claim.symbol} size={'small'} />
            </Box>
          ))}
        </Box>
      }
    />
  );
};

export const PendleExpiredCaptionBubble = () => {
  const theme = useTheme();
  return (
    <CaptionBubble
      caption="PT Expired"
      icon={
        <ClockIcon
          fill={theme.palette.pending.main}
          sx={{ fontSize: theme.typography.caption.fontSize }}
        />
      }
    />
  );
};

export const FinalizedWithdrawCaptionBubble = () => {
  const theme = useTheme();
  return (
    <CaptionBubble
      caption="Finalized Withdraw"
      icon={
        <CheckmarkIcon
          fill={theme.palette.success.main}
          sx={{ fontSize: theme.typography.caption.fontSize }}
        />
      }
    />
  );
};

export const PendingWithdrawCaptionBubble = () => {
  const theme = useTheme();
  return (
    <CaptionBubble
      caption="Pending Withdraw"
      icon={
        <HourglassIcon
          fill={theme.palette.pending.main}
          sx={{ fontSize: theme.typography.caption.fontSize }}
        />
      }
    />
  );
};

export const LockPeriodCaptionBubble = () => {
  const theme = useTheme();
  return (
    <CaptionBubble
      caption="Lock Period"
      icon={
        <LockIcon
          fill={theme.palette.pending.main}
          sx={{ fontSize: theme.typography.caption.fontSize }}
        />
      }
    />
  );
};
