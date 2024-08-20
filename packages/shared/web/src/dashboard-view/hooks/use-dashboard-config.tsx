import { useState } from 'react';
import { defineMessage } from 'react-intl';
import { FormattedMessage } from 'react-intl';
import { Network, PRODUCTS } from '@notional-finance/util';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelectedNetwork } from '@notional-finance/notionable-hooks';

export const config = {
  [PRODUCTS.LEVERAGED_POINTS_FARMING]: {
    containerData: {
      heading: defineMessage({
        defaultMessage: 'Leveraged Points Farming',
        description: 'page heading',
      }),
      subtitle: defineMessage({
        defaultMessage: `Boost your points yield from exciting partner protocols using leverage.`,
        description: 'page heading subtitle',
      }),
      linkText: defineMessage({
        defaultMessage: 'Read leveraged yield farming docs',
        description: 'docs link',
      }),
      docsLink:
        'https://docs.notional.finance/notional-v3/product-guides/leveraged-vaults',
      leveraged: true,
    },
  },
  [PRODUCTS.LEVERAGED_YIELD_FARMING]: {
    containerData: {
      heading: defineMessage({
        defaultMessage: 'Leveraged Yield Farming',
        description: 'page heading',
      }),
      subtitle: defineMessage({
        defaultMessage: `Earn leveraged yield from pegged asset liquidity pools in DeFi. Incentives are auto-harvested and reinvested.`,
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
      leveraged: true,
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
        defaultMessage: 'Lending',
        description: 'page heading',
      }),
      subtitle: defineMessage({
        defaultMessage: `Get easy access to the best yield in DeFi with zero fees.`,
        description: 'page subtitle',
      }),
      linkText: defineMessage({
        defaultMessage: 'Read lending docs',
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
        defaultMessage: 'Borrowing',
        description: 'page heading',
      }),
      subtitle: defineMessage({
        defaultMessage: `Stay flexible. Enter and exit your loan at any time without any costs.`,
        description: 'page heading subtitle',
      }),
      linkText: defineMessage({
        defaultMessage: 'Read borrowing docs',
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
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const selectedNetwork = useSelectedNetwork();
  const defaultNetwork = selectedNetwork === Network.mainnet ? 1 : 0;
  const [networkToggle, setNetworkToggle] = useState<number>(defaultNetwork);

  const handleNetWorkToggle = (v: number) => {
    const label = v === 0 ? Network.arbitrum : Network.mainnet;
    if (selectedNetwork) {
      setNetworkToggle(v);
      navigate(pathname.replace(selectedNetwork, label));
    }
  };

  const headerData = {
    messageBoxText: (
      <FormattedMessage defaultMessage={'Native Token Yield not shown.'} />
    ),
    networkToggle,
    handleNetWorkToggle,
  };

  return {
    containerData: config[routeKey].containerData,
    headerData: headerData,
  };
};

export default useDashboardConfig;
