import { Box, useTheme } from '@mui/material';
import { colors } from '@notional-finance/styles';
import { VaultStar } from '@notional-finance/icons';
import { Body, H1 } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';

export const TopBanner = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(3),
        borderRadius: theme.shape.borderRadius(),
        background: 'linear-gradient(45deg, rgb(0, 68, 83), rgb(0, 43, 54))',
        padding: theme.spacing(2, 2, 2, 3),
        minHeight: theme.spacing(10),
        marginBottom: theme.spacing(5),
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: theme.spacing(6),
          height: theme.spacing(6),
          borderRadius: theme.shape.borderRadius(),
          backgroundColor: 'rgba(51, 248, 255, 0.5)',
          flexShrink: 0,
        }}
      >
        <VaultStar
          sx={{
            width: theme.spacing(4),
            height: theme.spacing(4),
          }}
        />
      </Box>
      <Box
        sx={{
          width: '100%',
          maxWidth: theme.spacing(74),
        }}
      >
        <H1
          gutter="none"
          sx={{
            color: colors.white,
            fontSize: '20px',
            fontWeight: 600,
            marginBottom: theme.spacing(0.5),
          }}
        >
          <FormattedMessage
            defaultMessage="High Yields. Maximum Transparency."
            description="Top banner title"
          />
        </H1>
        <Body
          component="p"
          gutter="none"
          sx={{
            color: colors.purpleGrey,
            fontSize: '14px',
            fontWeight: 400,
            margin: 0,
          }}
        >
          <FormattedMessage
            defaultMessage="Earn leveraged APYs with deep liquidity and detailed analytics. Built for hands-on DeFi users."
            description="Top banner prompt text"
          />
        </Body>
      </Box>
    </Box>
  );
};
