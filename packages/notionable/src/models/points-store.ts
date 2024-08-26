import { flow, Instance, types } from 'mobx-state-tree';

const ArbPoint = types.model({
  token: types.string,
  points: types.number,
  season_one: types.number,
  season_two: types.number,
  season_three: types.number,
});

export const PointsStoreModel = types
  .model({
    arbPoints: types.array(ArbPoint),
    totalPoints: types.optional(types.number, 0),
  })
  .actions((self) => {
    const fetchPoints = flow(function* (selectedAddress) {
      try {
        const response = yield fetch(
          `https://points.notional.finance/arb_account_points/${selectedAddress.toLowerCase()}`
        );
        const arbPoints = yield response.json();
        self.arbPoints = arbPoints.map((point: any) => ArbPoint.create(point));
        self.totalPoints = self.arbPoints.reduce(
          (t, { points }) => t + points,
          0
        );
      } catch (error) {
        console.warn('Error fetching arb points', error);
      }
      return self.arbPoints;
    });

    const restoreDefault = () => {
      self.arbPoints.replace([{ token: '', points: 0, season_one: 0, season_two: 0, season_three: 0 }]);
      self.totalPoints = 0;
    };

    const initialize = (selectedAddress: string) => {
      if (selectedAddress) {
        fetchPoints(selectedAddress);
      } else {
        restoreDefault();
      }
      
    };
    return { fetchPoints, initialize, restoreDefault };
  });
  
export type PointsStoreType = Instance<typeof PointsStoreModel>;

export const pointsStore = PointsStoreModel.create({
  arbPoints: [],
  totalPoints: 0,
});
