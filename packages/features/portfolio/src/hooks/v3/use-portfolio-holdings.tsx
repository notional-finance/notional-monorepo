import { useAccountDefinition } from '@notional-finance/notionable-hooks';

export function usePortfolioHoldings() {
  const { account } = useAccountDefinition();
  return (
    account?.balances
      .filter(
        (b) =>
          !b.isVaultToken &&
          b.tokenType !== 'Underlying' &&
          b.tokenType !== 'NOTE'
      )
      .map((b) => {
        // TODO: need to pass this through a txn history filter...
        return {
          name: b.token.name,
          marketApy: '??',
          amountPaid: '??',
          presentValue: b.toUnderlying().toDisplayStringWithSymbol(2, true),
          totalEarnings: '??',
        };
      }) || []
  );
}
