import {
  Registry,
  TokenDefinition,
  YieldData,
} from '@notional-finance/core-entities';
import { formatMaturity } from './time-helpers';
import { PRIME_CASH_VAULT_MATURITY } from '@notional-finance/util';

export function truncateText(text: string, numOfChars: number) {
  return text.substring(0, numOfChars).concat('...');
}

/** Used with the transaction history table */
export function formatTokenType(token: TokenDefinition): {
  title: string;
  caption?: string;
} {
  switch (token.tokenType) {
    case 'Underlying':
    case 'nToken':
      return {
        title: token.symbol,
      };
    case 'PrimeCash':
    case 'PrimeDebt':
      return {
        title: token.name,
      };
    case 'fCash': {
      const underlying = Registry.getTokenRegistry().getUnderlying(
        token.network,
        token.currencyId
      );
      return {
        title: `f${underlying.symbol}`,
        caption: formatMaturity(token.maturity || 0),
      };
    }
    case 'VaultShare':
      return {
        title: 'Vault Shares',
        caption:
          token.maturity === PRIME_CASH_VAULT_MATURITY
            ? 'Open Term'
            : formatMaturity(token.maturity || 0),
      };
    case 'VaultDebt':
      return formatTokenType(
        Registry.getTokenRegistry().unwrapVaultToken(token)
      );
    default:
      return {
        title: token.symbol,
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
    return Registry.getConfigurationRegistry().getVaultConfig(
      y.token.network,
      y.token.vaultAddress
    ).name;
  }

  return undefined;
}
