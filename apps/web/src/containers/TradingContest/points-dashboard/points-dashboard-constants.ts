import { getNowSeconds } from '@notional-finance/util';

export function useCurrentSeason() {
  const now = getNowSeconds();
  if (now < PointsSeasonsData.seasonOne.endDate.getTime() / 1000) {
    return PointsSeasonsData.seasonOne;
  } else if (now < PointsSeasonsData.seasonTwo.endDate.getTime() / 1000) {
    return PointsSeasonsData.seasonTwo;
  } else {
    return PointsSeasonsData.seasonThree;
  }
}

export const PointsSeasonsData = {
  seasonOne: {
    name: 'Season One',
    startDate: new Date(2024, 5, 24),
    endDate: new Date(2024, 6, 22),
    totalArb: 55_000,
    totalPoints: '',
  },
  seasonTwo: {
    name: 'Season Two',
    startDate: new Date(2024, 6, 23),
    endDate: new Date(2024, 7, 19),
    totalArb: 60_000,
    totalPoints: '',
  },
  seasonThree: {
    name: 'Season Three',
    startDate: new Date(2024, 7, 20),
    endDate: new Date(2024, 8, 16),
    totalArb: 60_000,
    totalPoints: '',
  },
};
