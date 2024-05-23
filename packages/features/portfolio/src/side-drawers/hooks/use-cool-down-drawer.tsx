import { Registry } from '@notional-finance/core-entities';
import { useStakedNOTEPoolReady } from '@notional-finance/notionable-hooks';
import { SECONDS_IN_DAY, getNowSeconds } from '@notional-finance/util';

export const useCoolDownDrawer = () => {
  const isPoolReady = useStakedNOTEPoolReady();
  let days = 0;
  let coolDownBegin = 0;
  let coolDownEnd = 0;
  if (isPoolReady) {
    const sNOTEPool = Registry.getExchangeRegistry().getSNOTEPool();
    const nowInSeconds = getNowSeconds();
    if (sNOTEPool?.poolParams?.coolDownTimeInSeconds) {
      days = sNOTEPool?.poolParams?.coolDownTimeInSeconds / SECONDS_IN_DAY;
      coolDownBegin =
        nowInSeconds + sNOTEPool?.poolParams?.coolDownTimeInSeconds;
      coolDownEnd = SECONDS_IN_DAY * 3 + coolDownBegin;
    }
  }
  return { days: days, coolDownEnd: coolDownEnd, coolDownBegin: coolDownBegin };
};
