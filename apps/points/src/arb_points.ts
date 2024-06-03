export async function getAccountPoints(acct: string) {
  const accounts: { account: string; points: string; token: string }[] =
    await fetch('https://data-dev.notional.finance/arbitrum/views/points').then(
      (r) => r.json()
    );

  return accounts
    .filter(({ account }) => account.toLowerCase() === acct.toLowerCase())
    .map((p) => ({ ...p, points: parseFloat(p.points) }));
}
