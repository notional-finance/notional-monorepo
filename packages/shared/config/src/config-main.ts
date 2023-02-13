/* Main app configs go here */
export const APP_URL = 'https://notional.finance';
export const GOVERNANCE_STORAGE_PRODUCTION_URL =
  'https://notional-governance.storage.googleapis.com';
export const GOVERNANCE_STORAGE_DEVELOPMENT_URL =
  'https://notional-governance-development.storage.googleapis.com';
export const GOVERNANCE_STORAGE_STAGING_URL =
  'https://notional-governance-staging.storage.googleapis.com';

export const appConfig = {
  name: 'Notional',
  shortName: 'Notional',
  description: 'Fixed rate for DeFi',
  splashScreenBackground: '#ffffff',
};

export const manifestJSON = {
  name: 'Notional',
  short_name: 'Notional',
  description: 'Decentralized fixed rate loans',
  background_color: '#ffffff',
};

export const INTERNAL_TOKEN_DECIMAL_PLACES = 8;
const BASIS_POINT = 1e5;
export const ONE_WEEK = 86400 * 7;
// 5 min polling in ms, don't need to poll too often because using blocknative
export const DEFAULT_ACCOUNT_POLLING_INTERVAL = 300000;

export const defaultToastBarHideDuration = 8000;

export const tradeDefaults = {
  defaultBufferedRatio: 240,
  basisPoint: BASIS_POINT,
  defaultAnnualizedSlippage: BASIS_POINT * 50,
  defaultLoanToValueRatio: 33,
};

export const collateralDefaults = {
  minBufferedRatio: 100,
  minSelectableRatio: 100,
  maxBufferedRatio: 320,
  minLTV: 0,
  maxLTV: 100,
  labelLow: 33, // 300% collateral ratio
  labelMedium: 50, // 200% collateral ratio
  defaultMaxLoanToValue: 70,
  fcToNetValueRisk: 10, // Show high risk when FC is at 10% of net value
};

export const interestRateRiskDefaults = {
  minRate: 0,
  stepSize: 0.1,
};

export const socialMediaTags = [
  {
    attributes: {
      property: 'og:title',
      content: 'Notional Finance',
    },
  },
  {
    attributes: {
      property: 'og:description',
      content: 'Decentralized fixed rate loans',
    },
  },
  {
    attributes: {
      property: 'og:image',
      content: 'https://notional.finance/assets/notional-social-graph.png',
    },
  },
  {
    attributes: {
      property: 'og:url',
      content: 'https://notional.finance',
    },
  },
  {
    attributes: {
      property: 'og:site_name',
      content: 'Notional Finance',
    },
  },
  {
    attributes: {
      property: 'twitter:card',
      content: 'summary_large_image',
    },
  },
  {
    attributes: {
      property: 'twitter:image:alt',
      content: 'Notional Finance, fixed rate lending and borrowing on Ethereum',
    },
  },
  {
    attributes: {
      property: 'twitter:site',
      content: '@NotionalFinance',
    },
  },
  {
    attributes: {
      property: 'description',
      content: 'Fixed rate lending and borrowing on Ethereum',
    },
  },
];

export const siteMapPaths1 = [
  '/lend/',
  '/lend/DAI/',
  '/borrow/',
  '/borrow/DAI/',
  '/provide/',
  '/provide/DAI/',
  '/terms/',
  '/privacy/',
];

// Sitemaps for docs.notional.finance are hosted at:
// https://docs.notional.finance/traders/sitemap.xml
// https://docs.notional.finance/developers/sitemap.xml

export const TRANSITION_DELAY_MS = 100;
export const SYBIL_LIST_URL =
  'https://raw.githubusercontent.com/Uniswap/sybil-list/master/verified.json';

export interface TradeDefaults {
  defaultBufferedRatio: number;
  basisPoint: number;
  defaultAnnualizedSlippage: number;
  defaultLoanToValueRatio: number;
}
