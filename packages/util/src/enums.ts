export enum MARKET_TYPE {
  EARN = 'earn',
  BORROW = 'borrow',
}

export enum TXN_HISTORY_TYPE {
  PORTFOLIO_HOLDINGS = 'portfolio-holdings',
  LEVERAGED_VAULT = 'leveraged-vault',
}

export enum PRODUCTS {
  LEND_FIXED = 'lend-fixed',
  LEND_VARIABLE = 'lend-variable',
  LEND_LEVERAGED = 'lend-leveraged',
  LEVERAGED_VAULT = 'leveraged-vault',
  LIQUIDITY_VARIABLE = 'liquidity-variable',
  LIQUIDITY_LEVERAGED = 'liquidity-leveraged',
  BORROW_FIXED = 'borrow-fixed',
  BORROW_VARIABLE = 'borrow-variable',
}

export enum NOTIONAL_CATEGORIES {
  LEND = 'lend',
  BORROW = 'borrow',
  PROVIDE_LIQUIDITY = 'provide-liquidity',
  STAKE = 'stake',
}

export enum MOBILE_SUB_NAV_ACTIONS {
  EARN_YIELD = 'earn-yield',
  SETTINGS = 'settings',
  NOTIFICATIONS = 'notifications',
  VAULTS = 'vaults',
  BORROW = 'provide-liquidity',
  PROVIDE_LIQUIDITY = 'provide-liquidity',
  STAKE = 'stake',
  RESOURCES = 'resources',
  SECURITY = 'security',
  COMPANY = 'company',
}

export enum VAULT_SUB_NAV_ACTIONS {
  OVERVIEW = 'overview',
  MARKET_RETURNS = 'market-returns',
  RETURN_DRIVERS = 'return-drivers',
  STRATEGY_DETAILS = 'strategy-details',
  FAQ = 'faq',
  BACK_TO_TOP = 'back-to-top',
  FULL_DOCUMENTATION = 'full-documentation',
}

export enum PORTFOLIO_ACTIONS {
  ADD_TO_CALENDAR = 'add-to-calendar',
  DEPOSIT = 'deposit',
  REPAY_DEBT = 'repay-debt',
  ROLL_DEBT = 'roll-borrow',
  WITHDRAW = 'withdraw',
  CONVERT_ASSET = 'convert-asset',
  DELEVERAGE = 'deleverage',
  GET_NOTIFIED = 'get-notified',
  REMIND_ME = 'remind-me',
  MANAGE_VAULT = 'manage-vault',
  MANAGE_BORROW = 'manage-borrow',
  MANAGE_LEND = 'manage-lend',
}

export enum PORTFOLIO_CATEGORIES {
  OVERVIEW = 'overview',
  HOLDINGS = 'holdings',
  LEVERAGED_VAULTS = 'vaults',
  STAKED_NOTE = 'staked-note',
  TRANSACTION_HISTORY = 'transaction-history',
}

export enum CARD_CATEGORIES {
  LEND_FIXED = 'lend',
  BORROW_FIXED = 'borrow',
  LEVERAGED_VAULTS = 'vaults',
  PROVIDE_LIQUIDITY = 'provide',
}

export enum SETTINGS_SIDE_DRAWERS {
  SETTINGS = 'settings',
  NOTIFICATIONS = 'notifications',
  CONNECT_WALLET = 'connect-wallet',
}

export const SIDE_DRAWERS = {
  ...PORTFOLIO_ACTIONS,
  ...SETTINGS_SIDE_DRAWERS,
};

export enum NAV_DROPDOWN {
  ABOUT = 'About',
  RESOURCES = 'Resources',
  EARN_YIELD = 'Earn Yield',
  ANALYTICS = 'Analytics',
  BORROW = 'Borrow',
}

export enum THEME_VARIANTS {
  LIGHT = 'light',
  DARK = 'dark',
}

export enum LOCALES {
  EN_US = 'en-US',
  JA = 'ja',
  ZH_CN = 'zh-CN',
}

export type SIDE_DRAWERS_TYPE = SETTINGS_SIDE_DRAWERS | PORTFOLIO_ACTIONS;

export type RouteType =
  | 'Landing'
  | 'Card'
  | 'Markets'
  | 'Transaction'
  | 'Error'
  | 'Portfolio'
  | 'PortfolioTransaction'
  | 'Confirmation';

export enum DEX_ID {
  UNKNOWN,
  UNISWAP_V2,
  UNISWAP_V3,
  ZERO_EX,
  BALANCER_V2,
  CURVE,
  NOTIONAL_VAULT,
}

export enum TRADE_TYPE {
  EXACT_IN_SINGLE,
  EXACT_OUT_SINGLE,
  EXACT_IN_BATCH,
  EXACT_OUT_BATCH,
}
