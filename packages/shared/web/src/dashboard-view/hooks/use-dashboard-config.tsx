import { defineMessage } from 'react-intl';
import { useLocation } from 'react-router-dom';
// import { Network } from '@notional-finance/util';
import { useVaultDashboard } from './use-vault-dashboard';
import { FormattedMessage } from 'react-intl';
import { TokenIcon } from '@notional-finance/icons';
import { Box, useTheme } from '@mui/material';
import { useLiquidityLeveragedDashboard } from './use-liquidity-leveraged-dashboard';
// import { CardContainerProps } from '../../card-container/card-container';
import { useSelectedNetwork } from '@notional-finance/wallet';
import {
  //   LeveragedDashboardProps,
  InfoTooltip,
  //   ProductDashboardProps,
} from '@notional-finance/mui';

// interface DashboardConfig {
//   containerData: any;
//   useProductDashboard: (network: Network) => any;
//   headerData: any;
// }

export const useDashboardConfig = () => {
  const theme = useTheme();
  const { pathname } = useLocation();
  const network = useSelectedNetwork();
  const [_, routeKey] = pathname.split('/');

  const config = {
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
      useProductDashboard: useVaultDashboard,
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
      useProductDashboard: useLiquidityLeveragedDashboard,
    },
  };

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
    containerData:
      routeKey && config[routeKey] ? config[routeKey].containerData : undefined,
    productDashboardData:
      routeKey && config[routeKey]
        ? config[routeKey].useProductDashboard(network)
        : undefined,
    headerData: headerData,
  };
};

export default useDashboardConfig;
