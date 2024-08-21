import { getNowSeconds } from '@notional-finance/util';

export async function getAccountPoints(acct: string) {
  const accounts: {
    account: string;
    season_one: string;
    season_two: string;
    season_three: string;
    token: string;
  }[] = await fetch(
    'https://registry.notional.finance/arbitrum/views/points'
  ).then((r) => r.json());
  let currentSeason: string;
  const now = getNowSeconds();
  if (now < new Date(2024, 6, 22).getTime() / 1000) {
    currentSeason = 'season_one';
  } else if (now < new Date(2024, 7, 19).getTime() / 1000) {
    currentSeason = 'season_two';
  } else {
    currentSeason = 'season_three';
  }

  return accounts
    .filter(({ account }) => account.toLowerCase() === acct.toLowerCase())
    .map((p) => ({
      ...p,
      season_one: parseFloat(p.season_one),
      season_two: parseFloat(p.season_two),
      season_three: parseFloat(p.season_three),
    }))
    .map((p) => ({
      ...p,
      points: p[currentSeason],
    }));
}
