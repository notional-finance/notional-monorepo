import { formatMaturity } from '@notional-finance/helpers';
import { PORTFOLIO_ACTIONS } from '@notional-finance/shared-config';
import { CashGroup } from '@notional-finance/sdk/src/system';
import { useNotional } from '../use-notional';
import { useAccount } from './use-account';
import { useRiskThresholds } from './use-risk-thresholds';

export function useDeleverage() {
  const { accountDataCopy: accountData } = useAccount();
  const { system } = useNotional();
  const { hasInterestRateRisk } = useRiskThresholds(accountData);
  if (!hasInterestRateRisk || !system) return [];

  // If an account has interest rate risk, then repaying any debt will be sufficient
  // to reduce that risk. Optimally, the account could redeem a matching nToken to cash
  // in order to repay that debt.
  return (
    accountData.portfolio
      .filter((a) => a.notional.isNegative())
      // Sort from largest debt to smallest
      .sort((a, b) => (a.notional.gt(b.notional) ? -1 : 1))
      .map((a) => {
        const hasMatchingNToken = accountData
          .nTokenBalance(a.currencyId)
          ?.isPositive();
        const isIdiosyncratic = CashGroup.isIdiosyncratic(a.maturity);
        const underlyingSymbol = system.getUnderlyingSymbol(a.currencyId);
        const assetKey = `${a.currencyId}:${a.maturity}`;
        if (hasMatchingNToken) {
          return {
            label: `${formatMaturity(a.maturity)} ${underlyingSymbol}`,
            currencyId: a.currencyId,
            route: `/portfolio/${PORTFOLIO_ACTIONS.DELEVERAGE}?assetKey=${assetKey}&isIdiosyncratic=${isIdiosyncratic}`,
          };
        } else if (isIdiosyncratic) {
          // The user must deposit collateral if the debt is idiosyncratic and there is no
          // nToken to redeem
          return {
            label: `Deposit ${underlyingSymbol}`,
            currencyId: a.currencyId,
            route: `/portfolio/${PORTFOLIO_ACTIONS.DEPOSIT}?symbol=${underlyingSymbol}`,
          };
        } else {
          // If there is no matching nToken and the asset is tradable, then this will link directly to repay borrow
          return {
            label: `${formatMaturity(a.maturity)} ${underlyingSymbol}`,
            link: `/portfolio/${PORTFOLIO_ACTIONS.REPAY_BORROW}?assetKey=${assetKey}`,
          };
        }
      })
  );
}
