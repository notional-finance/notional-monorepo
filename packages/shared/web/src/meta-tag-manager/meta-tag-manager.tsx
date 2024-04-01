import { Helmet } from 'react-helmet-async';
import { META_TAG_CATEGORIES } from '@notional-finance/util';

const metaTagData = {
  [META_TAG_CATEGORIES.PORTFOLIO]: {
    title: 'Portfolio',
    description: 'Track and manage your Notional positions',
    url: '/portfolio',
  },
  [META_TAG_CATEGORIES.LEND_FIXED]: {
    title: 'Fixed rate lending',
    description: 'Lend your crypto at fixed rates to earn fixed returns',
    url: '/lend-fixed',
  },
  [META_TAG_CATEGORIES.LEND_VARIABLE]: {
    title: 'Variable rate lending',
    description: 'Lend your crypto at a variable rate to earn returns',
    url: '/lend-variable',
  },
  [META_TAG_CATEGORIES.BORROW_FIXED]: {
    title: 'Fixed rate borrowing',
    description: 'Borrow against your crypto at a fixed rate',
    url: '/borrow-fixed',
  },
  [META_TAG_CATEGORIES.BORROW_VARIABLE]: {
    title: 'Variable rate borrowing',
    description: 'Borrow against your crypto at a variable rate',
    url: '/borrow-variable',
  },
  [META_TAG_CATEGORIES.LIQUIDITY_VARIABLE]: {
    title: 'Provide liquidity',
    description: `Provide liquidity to Notional’s fixed rate pools to earn interest, fees, and incentives`,
    url: '/liquidity-variable',
  },
  [META_TAG_CATEGORIES.LIQUIDITY_LEVERAGED]: {
    title: 'Leveraged liquidity',
    description:
      'Loop your Notional liquidity to multiply your returns in one click',
    url: '/liquidity-leveraged',
  },
  [META_TAG_CATEGORIES.VAULTS]: {
    title: 'Leveraged vaults',
    description:
      'Earn leveraged yield from DeFi farming and staking strategies',
    url: '/vaults',
  },
  [META_TAG_CATEGORIES.MARKETS]: {
    title: 'All Markets',
    description: 'Explore and compare all of Notional’s opportunities',
    url: '/vaults',
  },
};

interface MetaTagManagerProps {
  metaTagCategory: META_TAG_CATEGORIES;
}

export const MetaTagManager = ({ metaTagCategory }: MetaTagManagerProps) => {
  return (
    <Helmet>
      <title>{metaTagData[metaTagCategory].title}</title>
      <meta name="title" content={metaTagData[metaTagCategory].title} />
      <meta
        name="description"
        content={metaTagData[metaTagCategory].description}
      />
      <link rel="canonical" href={metaTagData[metaTagCategory].url} />
    </Helmet>
  );
};

export default MetaTagManager;
