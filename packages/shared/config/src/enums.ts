export enum LEND_BORROW {
  LEND = 'lend',
  BORROW = 'borrow',
}

export enum NOTIONAL_CATEGORIES {
  LEND = 'lend',
  BORROW = 'borrow',
  PROVIDE_LIQUIDITY = 'provide-liquidity',
  STAKE = 'stake',
}

export enum MOBILE_SUB_NAV_ACTIONS {
  INVEST_AND_EARN = 'invest-and-earn',
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
  YIELD_DRIVERS = 'yeild-drivers',
  STRATEGY_DETAILS = 'strategy-details',
  BACK_TO_TOP = 'back-to-top',
  FULL_DOCUMENTATION = 'full-documentation',
}

export enum PORTFOLIO_ACTIONS {
  ADD_TO_CALENDAR = 'add-to-calendar',
  DEPOSIT = 'deposit',
  REPAY_CASH_DEBT = 'repay-cash-debt',
  REPAY_IFCASH_BORROW = 'repay-ifcash-borrow',
  REPAY_BORROW = 'repay-borrow',
  WITHDRAW = 'withdraw',
  WITHDRAW_LEND = 'withdraw-lend',
  ROLL_MATURITY = 'roll-maturity',
  CONVERT_CASH = 'convert-cash',
  REDEEM_NTOKEN = 'redeem-ntoken',
  // TODO: this should route to redeem-ntoken as a component
  DELEVERAGE = 'deleverage',
  GET_NOTIFIED = 'get-notified',
  REMIND_ME = 'remind-me',
  MANAGE_VAULT = 'manage-vault',
  MANAGE_BORROW = 'manage-borrow',
  MANAGE_LEND = 'manage-lend',
  WITHDRAW_CASH = 'withdraw-cash',
}

export enum WITHDRAW_TYPE {
  ONLY_CASH = 'only-cash',
  ONLY_NTOKEN = 'only-ntoken',
  BOTH = 'both',
  REDEEM_TO_CASH = 'only-redeem',
  REDEEM_ACCEPT_RESIDUALS = 'redeem-accept-residual',
}

export enum NTOKEN_ACTIONS {
  PROVIDE_LIQUIDITY = 'provide',
}

export enum VAULT_ACTIONS {
  CREATE_VAULT_POSITION = 'create-vault-position',
  INCREASE_POSITION = 'increase-position',
  DEPOSIT_COLLATERAL = 'deposit-collateral',
  ROLL_POSITION = 'roll-position',
  WITHDRAW_AND_REPAY_DEBT = 'withdraw-and-repay-debt',
  WITHDRAW_VAULT = 'withdraw-vault',
  WITHDRAW_VAULT_POST_MATURITY = 'withdraw-vault-post-maturity',
}

export enum PORTFOLIO_CATEGORIES {
  OVERVIEW = 'overview',
  LENDS = 'lends',
  BORROWS = 'borrows',
  TRANSACTION_HISTORY = 'transaction-history',
  LEVERAGED_VAULTS = 'vaults',
  LIQUIDITY = 'liquidity',
  STAKED_NOTE = 'staked-note',
  MONEY_MARKET = 'money-market',
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
  INVEST_AND_EARN = 'Invest and earn',
  ANALYTICS = 'Analytics',
}

export enum CHAIN_NAMES {
  GOERLI = 'Goerli',
  MAINNET = 'Mainnet',
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

export type TRANSACTION_ACTIONS =
  | LEND_BORROW
  | PORTFOLIO_ACTIONS
  | NTOKEN_ACTIONS;

export type SIDE_DRAWERS_TYPE = SETTINGS_SIDE_DRAWERS | PORTFOLIO_ACTIONS;
