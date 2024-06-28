import { getNowSeconds } from '@notional-finance/util';

export function useCurrentSeason() {
  const now = getNowSeconds();
  if (now < PointsSeasonsData.season_one.endDate.getTime() / 1000) {
    return PointsSeasonsData.season_one;
  } else if (now < PointsSeasonsData.season_two.endDate.getTime() / 1000) {
    return PointsSeasonsData.season_two;
  } else {
    return PointsSeasonsData.season_three;
  }
}

export const PointsSeasonsData = {
  season_one: {
    name: 'Season One',
    startDate: new Date(2024, 5, 24),
    endDate: new Date(2024, 6, 22),
    totalArb: 55_000,
    totalPoints: '',
  },
  season_two: {
    name: 'Season Two',
    startDate: new Date(2024, 6, 23),
    endDate: new Date(2024, 7, 19),
    totalArb: 60_000,
    totalPoints: '',
  },
  season_three: {
    name: 'Season Three',
    startDate: new Date(2024, 7, 20),
    endDate: new Date(2024, 8, 16),
    totalArb: 60_000,
    totalPoints: '',
  },
};
