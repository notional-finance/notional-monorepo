import { defineMessage } from 'react-intl';
import { FormattedMessage } from 'react-intl';
import { TokenIcon } from '@notional-finance/icons';
import { Box, useTheme } from '@mui/material';
import { InfoTooltip } from '@notional-finance/mui';

export const config = {
  vaults: {
    containerData: {
      heading: defineMessage({
        defaultMessage: 'Leveraged Vaults',
        description: 'page heading',
      }),
      subtitle: defineMessage({
        defaultMessage: `Get one-click access to sophisticated DeFi yield strategies and dial up your leverage for maximum efficiency.`,
        description: 'page heading subtitle',
      }),
      linkText: defineMessage({
        defaultMessage: 'Read leveraged vault docs',
        description: 'docs link',
      }),
      docsLink:
        'https://docs.notional.finance/notional-v3/product-guides/leveraged-vaults',
      leveraged: true,
    },
  },
  'liquidity-leveraged': {
    containerData: {
      heading: defineMessage({
        defaultMessage: 'Leveraged Liquidity',
        description: 'page heading',
      }),
      subtitle: defineMessage({
        defaultMessage: `Multiply your returns returns by providing liquidity with leverage. Select your borrow rate and leverage and put on the whole position in one transaction.
                    `,
        description: 'page heading subtitle',
      }),
      linkText: defineMessage({
        defaultMessage: 'Read leveraged liquidity docs',
        description: 'docs link',
      }),
      docsLink:
        'https://docs.notional.finance/notional-v3/product-guides/leveraged-liquidity',
    },
  },
};

export const useDashboardConfig = (routeKey) => {
  const theme = useTheme();

  const InfoComponent = () => {
    return (
      <Box
        sx={{
          fontSize: '14px',
          display: 'flex',
        }}
      >
        <Box
          sx={{
            background: theme.palette.background.paper,
            position: 'absolute',
            opacity: 0.5,
            height: '20px',
            width: '100px',
          }}
        ></Box>
        <TokenIcon
          symbol="eth"
          size="small"
          style={{ marginRight: theme.spacing(1) }}
        />
        Mainnet
      </Box>
    );
  };

  const headerData = {
    toggleOptions: [
      <Box sx={{ fontSize: '14px', display: 'flex' }}>
        <TokenIcon
          symbol="arb"
          size="small"
          style={{ marginRight: theme.spacing(1) }}
        />
        Arbitrum
      </Box>,
      <InfoTooltip
        toolTipText={defineMessage({
          defaultMessage: 'Mainnet coming soon',
        })}
        InfoComponent={InfoComponent}
      />,
    ],
    messageBoxText: (
      <FormattedMessage defaultMessage={'Native Token Yield not shown.'} />
    ),
  };

  return {
    containerData: config[routeKey].containerData,
    headerData: headerData,
  };
};

export default useDashboardConfig;
