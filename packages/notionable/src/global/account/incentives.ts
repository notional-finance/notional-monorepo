import {
  AccountDefinition,
  TokenBalance,
} from '@notional-finance/core-entities';
import {
  INTERNAL_TOKEN_PRECISION,
  SECONDS_IN_YEAR,
  getNowSeconds,
} from '@notional-finance/util';

export interface AccruedIncentives {
  currencyId: number;
  incentives: TokenBalance[];
  incentivesIn100Seconds: TokenBalance[];
}
export type TotalIncentives = Record<
  string,
  { current: TokenBalance; in100Sec: TokenBalance }
>;

export function calculateAccruedIncentives(account: AccountDefinition): {
  accruedIncentives: AccruedIncentives[];
  totalIncentives: TotalIncentives;
} {
  const accruedIncentives = account.balances
    .filter((t) => t.tokenType === 'nToken')
    .map((b) => {
      const incentives: TokenBalance[] = [];
      const incentivesIn100Seconds: TokenBalance[] = [];

      const noteDebt = account.accountIncentiveDebt?.find(
        ({ currencyId }) => currencyId === b.currencyId
      );
      if (noteDebt) {
        // TODO: Fix this  when live
        const lastAccumulatedTime = 0;
        const accumulatedNOTEPerNToken = TokenBalance.zero(b.token);
        const incentiveEmissionRate = TokenBalance.zero(b.token);
        // const {
        //   lastAccumulatedTime,
        //   accumulatedNOTEPerNToken,
        //   incentiveEmissionRate,
        // } = getAnnualizedNOTEIncentives(b.token);

        incentives.push(
          calculateIncentive(
            b,
            noteDebt.value,
            incentiveEmissionRate,
            accumulatedNOTEPerNToken,
            lastAccumulatedTime,
            undefined
          )
        );
        incentivesIn100Seconds.push(
          calculateIncentive(
            b,
            noteDebt.value,
            incentiveEmissionRate,
            accumulatedNOTEPerNToken,
            lastAccumulatedTime,
            undefined,
            getNowSeconds() + 100
          )
        );
      }

      const secondaryDebt = account.secondaryIncentiveDebt?.find(
        ({ currencyId }) => currencyId === b.currencyId
      );
      // TODO: fix this when live
      const secondary = {
        lastAccumulatedTime: 0,
        accumulatedRewardPerNToken: TokenBalance.zero(b.token),
        incentiveEmissionRate: TokenBalance.zero(b.token),
        rewardEndTime: 0,
      };

      if (secondaryDebt && secondary) {
        incentives.push(
          calculateIncentive(
            b,
            secondaryDebt.value,
            secondary.incentiveEmissionRate,
            secondary.accumulatedRewardPerNToken,
            secondary.lastAccumulatedTime,
            secondary.rewardEndTime
          )
        );
        incentivesIn100Seconds.push(
          calculateIncentive(
            b,
            secondaryDebt.value,
            secondary.incentiveEmissionRate,
            secondary.accumulatedRewardPerNToken,
            secondary.lastAccumulatedTime,
            secondary.rewardEndTime,
            getNowSeconds() + 100
          )
        );
      }

      return {
        currencyId: b.currencyId,
        incentives,
        incentivesIn100Seconds,
      };
    });

  const totalIncentives = accruedIncentives.reduce(
    (acc, { incentives, incentivesIn100Seconds }) => {
      incentives.forEach((i, j) => {
        const s = i.symbol;
        if (acc[s]) {
          acc[s].current = acc[s].current.add(i);
          acc[s].in100Sec = acc[s].in100Sec.add(incentivesIn100Seconds[j]);
        } else {
          acc[s] = {
            current: i,
            in100Sec: incentivesIn100Seconds[j],
          };
        }
      });

      return acc;
    },
    {} as Record<string, { current: TokenBalance; in100Sec: TokenBalance }>
  );

  return { accruedIncentives, totalIncentives };
}

function calculateIncentive(
  nTokenBalance: TokenBalance,
  accountIncentiveDebt: TokenBalance,
  incentiveEmissionRate: TokenBalance,
  accumulatedRewardPerNToken: TokenBalance | undefined,
  lastAccumulatedTime: number | undefined,
  rewardEndTime: number | undefined,
  blockTime = getNowSeconds()
) {
  if (
    lastAccumulatedTime === undefined ||
    accumulatedRewardPerNToken === undefined ||
    rewardEndTime === 0
  ) {
    return incentiveEmissionRate.copy(0);
  }

  // Update the stored accumulated to present time
  let timeSinceLastAccumulation =
    Math.min(blockTime, rewardEndTime || blockTime) - lastAccumulatedTime;
  // This may happen on an edge case when the reward end time is updated and the
  // configuration has also not updated accordingly.
  if (timeSinceLastAccumulation < 0) timeSinceLastAccumulation = 0;
  if (!nTokenBalance.token.totalSupply)
    throw Error('Missing nToken Total Supply');

  const updatedAccumulatedReward = accumulatedRewardPerNToken.add(
    incentiveEmissionRate
      .scale(timeSinceLastAccumulation, SECONDS_IN_YEAR)
      .scale(INTERNAL_TOKEN_PRECISION, nTokenBalance.token.totalSupply)
  );

  // This is the post migration incentive calculation
  return updatedAccumulatedReward
    .scale(nTokenBalance, nTokenBalance.precision)
    .sub(accountIncentiveDebt);
}
