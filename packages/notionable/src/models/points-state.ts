import { getNowSeconds } from '@notional-finance/util';
import { types, flow } from 'mobx-state-tree';

const Account = types.model({
    account: types.string,
    season_one: types.string,
    season_two: types.string,
    season_three: types.string,
    token: types.string,
});

const PointsState = types
    .model({
        accounts: types.array(Account),
        currentSeason: types.optional(types.string, ''),
    })
    .views(self => ({
        get points() {
            return self.accounts
                .filter(({ account }) => account.toLowerCase() === self.currentSeason.toLowerCase())
                .map(p => ({
                    ...p,
                    season_one: parseFloat(p.season_one),
                    season_two: parseFloat(p.season_two),
                    season_three: parseFloat(p.season_three),
                }))
                .map(p => ({
                    ...p,
                    points: p[self.currentSeason as keyof typeof p],
                }));
        },
    }))
    .actions(self => ({
        fetchAccounts: flow(function* () {
            try {
                const accounts = yield fetch('https://data-dev.notional.finance/arbitrum/views/points').then(r => r.json());
                self.accounts = accounts;
            } catch (error) {
                console.error('Failed to fetch accounts:', error);
            }
        }),
        setCurrentSeason() {
            const now = getNowSeconds();
            if (now < new Date(2024, 6, 22).getTime() / 1000) {
                self.currentSeason = 'season_one';
              } else if (now < new Date(2024, 7, 19).getTime() / 1000) {
                self.currentSeason = 'season_two';
              } else {
                self.currentSeason = 'season_three';
              }
        },
    }));

export const PointsStore = PointsState.create({
    accounts: [],
});

