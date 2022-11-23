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
  VAULTS = 'vaults',
  BORROW = 'provide-liquidity',
  PROVIDE_LIQUIDITY = 'provide-liquidity',
  STAKE = 'stake',
  RESOURCES = 'resources',
  SECURITY = 'security',
  COMPANY = 'company',
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
  DELEVERAGE_VAULT = 'deleverage-vault',
  DELEVERAGE_VAULT_SELL_ASSETS = 'deleverage-vault-sell-assets',
  DELEVERAGE_VAULT_DEPOSIT = 'deleverage-vault-deposit',
  WITHDRAW_VAULT = 'withdraw-vault',
  WITHDRAW_VAULT_POST_MATURITY = 'withdraw-vault-post-maturity',
  GET_NOTIFIED = 'get-notified',
  REMIND_ME = 'remind-me',
}

export enum WITHDRAW_TYPE {
  ONLY_CASH = 'only-cash',
  ONLY_NTOKEN = 'only-ntoken',
  BOTH = 'both',
  REDEEM_TO_CASH = 'only-redeem',
}

export enum NTOKEN_ACTIONS {
  PROVIDE_LIQUIDITY = 'provide',
}

export enum VAULT_ACTIONS {
  ESTABLISH_ACCOUNT = 'establish-account',
  INCREASE_POSITION = 'increase-position',
  ROLL_POSITION = 'roll-position',
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

export enum SIDEBAR_CATEGORIES {
  SETTINGS = 'settings',
  NOTIFICATIONS = 'notifications',
  CONNECT_WALLET = 'connect-wallet',
}

export enum NAV_DROPDOWN {
  ABOUT = 'About',
  RESOURCES = 'Resources',
  INVEST_AND_EARN = 'Invest and earn',
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
export type SIDE_DRAWERS = SIDEBAR_CATEGORIES | PORTFOLIO_ACTIONS;
