import { useTheme, Box, Button } from '@mui/material';
import { ButtonText } from '../typography/typography';
import { DiscordIcon } from '@notional-finance/icons';
import { trackOutboundLink } from '@notional-finance/helpers';

 
export interface DiscordButtonGradientProps {
  buttonText: React.ReactNode;
}

export function DiscordButtonGradient({
  buttonText,
}: DiscordButtonGradientProps) {
  const theme = useTheme();
  return (
    <Button
      sx={{
        textTransform: 'none',
        background: 'linear-gradient(0deg, #2BCAD0 0%, #8BC1E5 100%)',
        padding: theme.spacing(2, 2),
        borderRadius: theme.shape.borderRadius(),
      }}
      startIcon={
        <Box
          sx={{
            background: theme.palette.primary.dark,
            borderRadius: theme.shape.borderRadius(),
            width: theme.spacing(4),
            height: theme.spacing(4),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <DiscordIcon
            sx={{ marginTop: '1px', fill: theme.palette.common.white }}
          />
        </Box>
      }
      href="https://discord.notional.finance"
      target="_blank"
      rel="noreferrer"
      onClick={() => trackOutboundLink('https://discord.notional.finance')}
    >
      <ButtonText fontWeight="medium">{buttonText}</ButtonText>
    </Button>
  );
}

export default DiscordButtonGradient;
