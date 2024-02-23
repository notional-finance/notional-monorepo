import { defineMessage } from 'react-intl';
import { FormattedMessage } from 'react-intl';
import { TokenIcon } from '@notional-finance/icons';
import { Box, useTheme } from '@mui/material';
import { PRODUCTS } from '@notional-finance/util';
import { InfoTooltip } from '@notional-finance/mui';

export const config = {
  [PRODUCTS.VAULTS]: {
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
  [PRODUCTS.LIQUIDITY_LEVERAGED]: {
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
  [PRODUCTS.LIQUIDITY_VARIABLE]: {
    containerData: {
      heading: defineMessage({
        defaultMessage: 'Provide Liquidity',
        description: 'page heading',
      }),
      subtitle: defineMessage({
        defaultMessage: `Set it and forget it. Earn passive interest, fees, and NOTE from depositing into Notional's fixed rate liquidity pools.`,
        description: 'page heading subtitle',
      }),
      linkText: defineMessage({
        defaultMessage: 'Read provide liquidity docs',
        description: 'docs link',
      }),
      docsLink:
        'https://docs.notional.finance/notional-v3/product-guides/providing-liquidity',
    },
  },
  [PRODUCTS.LEND_VARIABLE]: {
    containerData: {
      heading: defineMessage({
        defaultMessage: 'Variable Rate Lending',
        description: 'page heading',
      }),
      subtitle: defineMessage({
        defaultMessage: `Get easy access to the best yield in DeFi with zero fees.`,
        description: 'page subtitle',
      }),
      linkText: defineMessage({
        defaultMessage: 'Read variable lend docs',
        description: 'docs link',
      }),
      docsLink:
        'https://docs.notional.finance/notional-v3/product-guides/variable-rate-lending',
    },
  },
  [PRODUCTS.LEND_FIXED]: {
    containerData: {
      heading: defineMessage({
        defaultMessage: 'Fixed Rate Lending',
        description: 'page heading',
      }),
      subtitle: defineMessage({
        defaultMessage: `Fix your rate and earn guaranteed returns with peace of mind.`,
        description: 'page subtitle',
      }),
      linkText: defineMessage({
        defaultMessage: 'Read fixed lend docs',
        description: 'docs link',
      }),
      docsLink:
        'https://docs.notional.finance/notional-v3/product-guides/fixed-rate-lending',
    },
  },
  [PRODUCTS.BORROW_VARIABLE]: {
    containerData: {
      heading: defineMessage({
        defaultMessage: 'Variable Rate Borrowing',
        description: 'page heading',
      }),
      subtitle: defineMessage({
        defaultMessage: `Stay flexible. Enter and exit your loan at any time without any costs.`,
        description: 'page heading subtitle',
      }),
      linkText: defineMessage({
        defaultMessage: 'Read variable borrow docs',
        description: 'docs link',
      }),
      docsLink:
        'https://docs.notional.finance/notional-v3/product-guides/variable-rate-borrowing',
    },
  },
  [PRODUCTS.BORROW_FIXED]: {
    containerData: {
      heading: defineMessage({
        defaultMessage: 'Fixed Rate Borrowing',
        description: 'page heading',
      }),
      subtitle: defineMessage({
        defaultMessage: `Fix your rate and never worry about spiking borrowing costs again.`,
        description: 'page heading subtitle',
      }),
      linkText: defineMessage({
        defaultMessage: 'Read fixed borrow docs',
        description: 'docs link',
      }),
      docsLink:
        'https://docs.notional.finance/notional-v3/product-guides/fixed-rate-borrowing',
    },
  },
};

export const useDashboardConfig = (routeKey: PRODUCTS) => {
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
