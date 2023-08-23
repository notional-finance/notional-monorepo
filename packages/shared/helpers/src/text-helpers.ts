import {
  Registry,
  TokenDefinition,
  YieldData,
} from '@notional-finance/core-entities';
import { formatMaturity } from './time-helpers';
import { PRIME_CASH_VAULT_MATURITY } from '@notional-finance/util';

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
  titleWithMaturity: string;
} {
  switch (token.tokenType) {
    case 'Underlying':
    case 'nToken':
      return {
        title: token.symbol,
        icon: token.symbol,
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
      };
    case 'PrimeCash':
      return {
        title: token.name,
        icon: token.symbol,
        titleWithMaturity: token.name,
      };
    case 'fCash': {
      const underlying = Registry.getTokenRegistry().getUnderlying(
        token.network,
        token.currencyId
      );

      return {
        title: `f${underlying.symbol}`,
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
        icon: token.symbol,
        titleWithMaturity: token.symbol,
      };
  }
}

/** For use with all markets page */
export function formatYieldCaption(y: YieldData) {
  if (y.token.tokenType === 'fCash') {
    if (y.leveraged?.debtToken.tokenType === 'PrimeDebt') {
      return 'Variable Borrow';
    } else if (y.leveraged?.debtToken.tokenType === 'fCash') {
      return `Fixed Borrow: ${formatMaturity(
        y.leveraged.debtToken.maturity || 0
      )}`;
    } else if (y.leveraged === undefined) {
      return formatMaturity(y.token.maturity || 0);
    }
  } else if (y.token.tokenType === 'nToken') {
    if (y.leveraged?.debtToken.tokenType === 'PrimeDebt') {
      return 'Variable Borrow';
    } else if (y.leveraged?.debtToken.tokenType === 'fCash') {
      return `Fixed Borrow: ${formatMaturity(
        y.leveraged.debtToken.maturity || 0
      )}`;
    } else if (y.leveraged === undefined) {
      return undefined;
    }
  } else if (y.token.tokenType === 'VaultShare' && y.token.vaultAddress) {
    return Registry.getConfigurationRegistry().getVaultName(
      y.token.network,
      y.token.vaultAddress
    );
  }

  return undefined;
}
