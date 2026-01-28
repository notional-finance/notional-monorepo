import { Box, useTheme } from '@mui/material';
import { TokenIcon, VaultStar } from '@notional-finance/icons';
import { Button, Dropdown, H3, Paragraph, Toggle } from '@notional-finance/mui';
import { useAppStore } from '@notional-finance/notionable-hooks';
import { useNotionalTheme } from '@notional-finance/styles';
import { THEME_VARIANTS } from '@notional-finance/util';
import { defineMessage, FormattedMessage } from 'react-intl';

const TopBanner = () => {
  const { themeVariant } = useAppStore();
  const theme = useNotionalTheme(
    themeVariant == THEME_VARIANTS.LIGHT
      ? THEME_VARIANTS.DARK
      : THEME_VARIANTS.LIGHT
  );

  return (
    <Box
      sx={{
        background: theme.palette.background.paper,
        display: 'flex',
        alignItems: 'center',
        borderRadius: theme.shape.borderRadiusLarge,
        padding: theme.spacing(2, 3),
        marginBottom: theme.spacing(5),
      }}
    >
      <Box
        sx={{
          background: theme.palette.primary.accent,
          padding: theme.spacing(1),
          borderRadius: theme.shape.borderRadiusLarge,
          display: 'flex',
        }}
      >
        <VaultStar sx={{ width: theme.spacing(4), height: theme.spacing(4) }} />
      </Box>
      <Box sx={{ marginLeft: theme.spacing(3) }}>
        <H3 contrast gutterBottom>
          <FormattedMessage
            defaultMessage="High Yields. Maximum Transparency."
            description="Top banner title"
          />
        </H3>
        <Paragraph contrast>
          <FormattedMessage
            defaultMessage="Earn leveraged APYs with deep liquidity and detailed analytics. Built for hands-on DeFi users."
            description="Top banner prompt text"
          />
        </Paragraph>
      </Box>
    </Box>
  );
};

export const VaultList = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        marginTop: theme.spacing(9),
        padding: theme.spacing(0, 9),
      }}
    >
      <TopBanner />
      <Box
        sx={{ display: 'flex', alignItems: 'center', gap: theme.spacing(3) }}
      >
        <Toggle
          selectedTabIndex={0}
          tabLabels={[
            <FormattedMessage
              defaultMessage="All Tokens"
              description="Toggle label"
            />,
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing(1),
              }}
            >
              <TokenIcon symbol="usdc" size="small" />
              <FormattedMessage
                defaultMessage="USDC"
                description="Toggle label"
              />
            </Box>,
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing(1),
              }}
            >
              <TokenIcon symbol="weth" size="small" />
              <FormattedMessage
                defaultMessage="WETH"
                description="Toggle label"
              />
            </Box>,
          ]}
        />
        <Dropdown
          buttonText={defineMessage({
            defaultMessage: 'Strategy Type',
            description: 'Dropdown button text',
          })}
          dropDownItems={[
            { label: 'All Tokens', href: '/vaults-list' },
            { label: 'USDC', href: '/vaults-list/usdc' },
            { label: 'WETH', href: '/vaults-list/weth' },
          ]}
          open={false}
        />
        <Button variant="outlined" size="medium">
          Clear All
        </Button>
      </Box>
    </Box>
  );
};
