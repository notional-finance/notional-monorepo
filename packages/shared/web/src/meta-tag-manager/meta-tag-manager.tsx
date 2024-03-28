import { Helmet } from 'react-helmet-async';
import { META_TAG_CATEGORIES } from '@notional-finance/util';

const metaTagData = {
  [META_TAG_CATEGORIES.LEND_FIXED_DASHBOARD]: {
    title: 'Fixed Rate Lending',
    description: 'Fixed rate lending dashboard',
    url: '/lend-fixed',
  },
  [META_TAG_CATEGORIES.LEND_VARIABLE_DASHBOARD]: {
    title: 'Variable Rate Lending',
    description: 'Variable rate lending dashboard',
    url: '/lend-variable',
  },
  [META_TAG_CATEGORIES.BORROW_FIXED_DASHBOARD]: {
    title: 'Fixed Rate Borrowing',
    description: 'Fixed rate borrowing dashboard',
    url: '/borrow-fixed',
  },
  [META_TAG_CATEGORIES.BORROW_VARIABLE_DASHBOARD]: {
    title: 'Variable Rate Borrowing',
    description: 'Variable rate borrowing dashboard',
    url: '/borrow-variable',
  },
  [META_TAG_CATEGORIES.LIQUIDITY_VARIABLE_DASHBOARD]: {
    title: 'Variable Rate Liquidity',
    description: 'Variable rate liquidity dashboard',
    url: '/liquidity-variable',
  },
  [META_TAG_CATEGORIES.LIQUIDITY_LEVERAGED_DASHBOARD]: {
    title: 'Leveraged Liquidity',
    description: 'Leveraged liquidity dashboard',
    url: '/liquidity-leveraged',
  },
  [META_TAG_CATEGORIES.VAULTS_DASHBOARD]: {
    title: 'Vaults',
    description: 'Vaults dashboard',
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
