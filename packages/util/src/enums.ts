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
  VAULTS = 'vaults',
  LEVERAGED_YIELD_FARMING = 'leveraged-yield-farming',
  LEVERAGED_POINTS_FARMING = 'leveraged-points-farming',
  LEVERAGED_PENDLE = 'leveraged-pendle',
  LIQUIDITY_VARIABLE = 'liquidity-variable',
  LIQUIDITY_LEVERAGED = 'liquidity-leveraged',
  BORROW_FIXED = 'borrow-fixed',
  BORROW_VARIABLE = 'borrow-variable',
  STAKE_NOTE = 'stake',
}

export enum META_TAG_CATEGORIES {
  PORTFOLIO = 'portfolio',
  LEND_FIXED = 'lend-fixed',
  LEND_VARIABLE = 'lend-variable',
  BORROW_FIXED = 'borrow-fixed',
  BORROW_VARIABLE = 'borrow-variable',
  LIQUIDITY_VARIABLE = 'liquidity-variable',
  LIQUIDITY_LEVERAGED = 'liquidity-leveraged',
  VAULTS = 'vaults',
  MARKETS = 'markets',
}

export enum NOTIONAL_CATEGORIES {
  LEND = 'lend',
  BORROW = 'borrow',
  PROVIDE_LIQUIDITY = 'provide-liquidity',
  STAKE = 'stake',
}

export enum ANALYTICS_VIEWS {
  ALL_TRANSACTIONS = 'all-transactions',
  ALL_ACCOUNTS = 'all-accounts',
  ALL_VAULT_ACCOUNTS = 'all-vault-accounts',
}

export enum MOBILE_SUB_NAV_ACTIONS {
  EARN_YIELD = 'earn-yield',
  SETTINGS = 'settings',
  NOTIFICATIONS = 'notifications',
  VAULTS = 'vaults',
  BORROW = 'borrow',
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
  MANAGE_VAULT = 'manage-vault',
  MANAGE_BORROW = 'manage-borrow',
  MANAGE_LEND = 'manage-lend',
  COOL_DOWN = 'cool-down',
}

export enum PORTFOLIO_STATE_ZERO_OPTIONS {
  EARN = 0,
  LEVERAGE = 1,
  BORROW = 2,
}

export enum PORTFOLIO_CATEGORIES {
  OVERVIEW = 'overview',
  HOLDINGS = 'holdings',
  LEVERAGED_VAULTS = 'vaults',
  NOTE_STAKING = 'note-staking',
  TRANSACTION_HISTORY = 'transaction-history',
  WELCOME = 'welcome',
}

export enum ROUTE_MATCH {
  PORTFOLIO_OVERVIEW = 'portfolio-overview',
  PORTFOLIO_HOLDINGS = 'portfolio-holdings',
  PORTFOLIO_VAULTS = 'portfolio-vaults',
  PORTFOLIO_NOTE_STAKING = 'portfolio-note-staking',
  PORTFOLIO_TRANSACTION_HISTORY = 'portfolio-transaction-history',
  PORTFOLIO_WELCOME = 'portfolio-welcome',
  LEND_FIXED = 'lend-fixed',
  LEND_VARIABLE = 'lend-variable',
  LEND_LEVERAGED = 'lend-leveraged',
  VAULTS = 'vaults',
  LEVERAGED_YIELD_FARMING = 'leveraged-yield-farming',
  LEVERAGED_POINTS_FARMING = 'leveraged-points-farming',
  LIQUIDITY_VARIABLE = 'liquidity-variable',
  LIQUIDITY_LEVERAGED = 'liquidity-leveraged',
  BORROW_FIXED = 'borrow-fixed',
  BORROW_VARIABLE = 'borrow-variable',
}

export enum CONTEST_SIGN_UP_STEPS {
  LOADING = 'loading',
  CONNECT_WALLET = 'connect-wallet',
  COMMUNITY_PARTNERS = 'community-partners',
  MINT_PASS = 'mint-pass',
  CONTEST_CONFIRMATION = 'contest-confirmation',
}

export enum CARD_CATEGORIES {
  LEND_FIXED = 'lend-fixed',
  LEND_VARIABLE = 'lend-variable',
  BORROW_FIXED = 'borrow-fixed',
  BORROW_VARIABLE = 'borrow-variable',
  LEVERAGED_VAULTS = 'vaults',
  LIQUIDITY_LEVERAGED = 'liquidity-leveraged',
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
  EARN = 'Earn',
  LEVERAGE = 'Leverage',
  ANALYTICS = 'Analytics',
  BORROW = 'Borrow',
}

export enum SEASONS {
  SEASON_ONE = 'season_one',
  SEASON_TWO = 'season_two',
  SEASON_THREE = 'season_three',
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

export enum TRACKING_EVENTS {
  HOW_IT_WORKS = 'HowItWorks',
  FAQ = 'FAQ',
  HOVER_TOOL_TIP = 'HoverTooltip',
  TOOL_TIP = 'ToolTip',
  NFT_UNLOCK = 'NFTUnlock',
  SUBMIT_TXN = 'SubmitTxn',
  REJECT_TXN = 'RejectTxn',
  CONFIRMATION = 'Confirmation',
  DISCONNECT_WALLET = 'DisconnectWallet',
  WALLET_CONNECTED = 'WalletConnected',
}

export type SIDE_DRAWERS_TYPE = SETTINGS_SIDE_DRAWERS | PORTFOLIO_ACTIONS;

export type RouteType =
  | 'Landing'
  | 'Card'
  | 'Analytics'
  | 'Note'
  | 'Transaction'
  | 'Error'
  | 'Portfolio'
  | 'PortfolioTransaction'
  | 'Confirmation'
  | 'Contest';

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
