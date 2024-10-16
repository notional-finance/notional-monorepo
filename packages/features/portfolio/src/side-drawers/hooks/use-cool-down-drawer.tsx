import { SECONDS_IN_DAY, getNowSeconds } from '@notional-finance/util';
import { useSNOTEPool } from '@notional-finance/notionable-hooks';

export const useCoolDownDrawer = () => {
  let days = 0;
  let coolDownBegin = 0;
  let coolDownEnd = 0;
  const sNOTEPool = useSNOTEPool();
  const nowInSeconds = getNowSeconds();
  if (sNOTEPool?.poolParams?.coolDownTimeInSeconds) {
    days = sNOTEPool?.poolParams?.coolDownTimeInSeconds / SECONDS_IN_DAY;
    coolDownBegin = nowInSeconds + sNOTEPool?.poolParams?.coolDownTimeInSeconds;
    coolDownEnd = SECONDS_IN_DAY * 3 + coolDownBegin;
  }
  return { days: days, coolDownEnd: coolDownEnd, coolDownBegin: coolDownBegin };
};
