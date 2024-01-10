import { RATE_PRECISION } from '@notional-finance/util';
import { AccountDefinition } from '../../Definitions';
import { TokenBalance } from '../../token-balance';

export function calculateHoldingGroups(account: AccountDefinition) {
  const balances =
    account?.balances.filter(
      (b) =>
        !b.isZero() &&
        !b.isVaultToken &&
        b.token.tokenType !== 'Underlying' &&
        b.token.tokenType !== 'NOTE'
    ) || [];
  const assets = balances.filter((b) => b.isPositive());
  const debts = balances.filter((b) => b.isNegative());

  return assets.reduce((l, asset) => {
    const matchingDebts = debts.filter(
      (b) => b.currencyId === asset.currencyId
    );
    const matchingAssets = assets.filter(
      (b) => b.currencyId === asset.currencyId && asset.tokenType === 'nToken'
    );

    // Only creates a grouped holding if there is exactly one matching asset and debt
    if (matchingDebts.length === 1 && matchingAssets.length === 1) {
      const asset = matchingAssets[0];
      const debt = matchingDebts[0];
      const presentValue = asset.toUnderlying().add(debt.toUnderlying());
      const leverageRatio =
        debt.toUnderlying().neg().ratioWith(presentValue).toNumber() /
        RATE_PRECISION;

      // NOTE: enforce a minimum leverage ratio on these to ensure that dust balances
      // don't create leveraged positions
      if (leverageRatio > 0.05) {
        l.push({ asset, debt, presentValue, leverageRatio });
      }
    }

    return l;
  }, [] as { asset: TokenBalance; debt: TokenBalance; presentValue: TokenBalance; leverageRatio: number }[]);
}
