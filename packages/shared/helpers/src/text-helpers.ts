import { Registry, TokenDefinition } from '@notional-finance/core-entities';
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
export function formatTokenType(
  token: TokenDefinition,
  isDebt?: boolean
): {
  title: string;
  icon: string;
  caption?: string;
  formattedTitle: string;
  titleWithMaturity: string;
} {
  const underlying =
    token.tokenType === 'NOTE' || token.tokenType === 'Underlying'
      ? token
      : Registry.getTokenRegistry().getUnderlying(
          token.network,
          token.currencyId
        );
  switch (token.tokenType) {
    case 'Underlying':
    case 'nToken':
      return {
        title: token.symbol,
        icon: token.symbol,
        formattedTitle: `${underlying.symbol} Liquidity`,
        titleWithMaturity: token.symbol,
      };
    case 'PrimeDebt':
      return {
        title: token.name,
        // Prime Debt shares the same icon as Prime Cash
        icon: Registry.getTokenRegistry().getPrimeCash(
          token.network,
          token.currencyId
        ).symbol,
        titleWithMaturity: token.name,
        formattedTitle: `Variable ${underlying.symbol} Borrow`,
      };
    case 'PrimeCash':
      return {
        title: token.name,
        icon: token.symbol,
        titleWithMaturity: token.name,
        formattedTitle: `Variable ${underlying.symbol} Lend`,
      };
    case 'fCash': {
      return {
        title: `f${underlying.symbol}`,
        formattedTitle: `Fixed ${underlying.symbol} ${
          isDebt ? 'Borrow' : 'Lend'
        }`,
        caption: formatMaturity(token.maturity || 0),
        icon: `f${underlying.symbol}`,
        titleWithMaturity: `f${underlying.symbol} ${formatMaturity(
          token.maturity || 0
        )}`,
      };
    }
    case 'VaultShare': {
      const maturity =
        token.maturity === PRIME_CASH_VAULT_MATURITY
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
    case 'VaultDebt':
    case 'VaultCash':
      return formatTokenType(
        Registry.getTokenRegistry().unwrapVaultToken(token)
      );
    default:
      return {
        title: token.symbol,
        formattedTitle: token.symbol,
        icon: token.symbol,
        titleWithMaturity: token.symbol,
      };
  }
}
