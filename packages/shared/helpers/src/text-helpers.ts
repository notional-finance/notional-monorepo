import {
  getNetworkModel,
  TokenDefinition,
} from '@notional-finance/core-entities';
import {
  PRIME_CASH_VAULT_MATURITY,
  formatMaturity,
} from '@notional-finance/util';

export function truncateAddress(
  address: string,
  firstCharsNum = 6,
  lastCharsNum = 4
) {
  const truncatedAddress = `${address.slice(
    0,
    firstCharsNum
  )}...${address.slice(address.length - lastCharsNum)}`;
  return truncatedAddress;
}

export function truncateText(text: string, numOfChars: number) {
  return text.substring(0, numOfChars).concat('...');
}

/** Used with the transaction history table */
export function formatTokenType(token: TokenDefinition): {
  title: string;
  icon: string;
  caption?: string;
  formattedTitle: string;
  titleWithMaturity: string;
} {
  switch (token.tokenType) {
    case 'Underlying':
      return {
        title: token.symbol,
        icon: token.iconURL || token.symbol,
        formattedTitle: token.symbol,
        titleWithMaturity: token.symbol,
      };
    case 'VaultShare': {
      const maturity =
        token.maturity === PRIME_CASH_VAULT_MATURITY ||
        token.maturity === undefined
          ? 'Open Term'
          : formatMaturity(token.maturity || 0);

      return {
        title: 'Vault Shares',
        formattedTitle: 'Vault Shares',
        icon: token.tokenType,
        caption: maturity,
        titleWithMaturity: `Vault Shares ${maturity}`,
      };
    }
    case 'VaultDebt': {
      const maturity =
        token.maturity === PRIME_CASH_VAULT_MATURITY ||
        token.maturity === undefined
          ? 'Open Term'
          : formatMaturity(token.maturity || 0);
      const model = getNetworkModel(token.network);
      const lendingRouter = model.getLendingRouter(token.address);
      const title = lendingRouter?.name
        ? `${lendingRouter?.name} Variable Debt`
        : 'Variable Debt';

      return {
        title,
        formattedTitle: title,
        icon: lendingRouter?.name || 'unknown',
        caption: maturity,
        titleWithMaturity: token.maturity ? `${title} ${maturity}` : '',
      };
    }
    default:
      return {
        title: token.symbol,
        formattedTitle: token.symbol,
        icon: token.symbol,
        titleWithMaturity: token.symbol,
      };
  }
}
