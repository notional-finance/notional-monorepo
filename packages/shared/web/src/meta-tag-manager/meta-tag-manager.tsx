import { Helmet } from 'react-helmet-async';
import { META_TAG_CATEGORIES } from '@notional-finance/util';

export const metaTagData = {
  [META_TAG_CATEGORIES.PORTFOLIO]: {
    title: 'Portfolio',
    description: 'Track and manage your Notional positions',
    url: '/portfolio',
  },
  [META_TAG_CATEGORIES.LEND_FIXED]: {
    title: 'Fixed Rate Lending',
    description: 'Lend your crypto at fixed rates to earn fixed returns',
    url: '/lend-fixed',
  },
  [META_TAG_CATEGORIES.LEND_VARIABLE]: {
    title: 'Variable Rate Lending',
    description: 'Lend your crypto at a variable rate to earn returns',
    url: '/lend-variable',
  },
  [META_TAG_CATEGORIES.BORROW_FIXED]: {
    title: 'Fixed Rate Borrowing',
    description: 'Borrow against your crypto at a fixed rate',
    url: '/borrow-fixed',
  },
  [META_TAG_CATEGORIES.BORROW_VARIABLE]: {
    title: 'Variable Rate Borrowing',
    description: 'Borrow against your crypto at a variable rate',
    url: '/borrow-variable',
  },
  [META_TAG_CATEGORIES.LIQUIDITY_VARIABLE]: {
    title: 'Provide Liquidity',
    description: `Provide liquidity to Notional's fixed rate pools to earn interest, fees, and incentives`,
    url: '/liquidity-variable',
  },
  [META_TAG_CATEGORIES.LIQUIDITY_LEVERAGED]: {
    title: 'Leveraged Liquidity',
    description:
      'Loop your Notional liquidity to multiply your returns in one click',
    url: '/liquidity-leveraged',
  },
  [META_TAG_CATEGORIES.VAULTS]: {
    title: 'Leveraged Vaults',
    description:
      'Earn leveraged yield from DeFi farming and staking strategies',
    url: '/vaults',
  },
  [META_TAG_CATEGORIES.MARKETS]: {
    title: 'All Markets',
    description: `Explore and compare all of Notional's opportunities`,
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
