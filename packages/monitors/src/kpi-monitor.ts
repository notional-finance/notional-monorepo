import { JobOptions, MonitorJob, VolumeKPI } from './types';
import GraphClient, {
  Account,
  DailyLendBorrowVolume,
} from '@notional-finance/graph-client';
import { log, submitMetrics } from '@notional-finance/logging';
import { DDMetric } from '@notional-finance/logging';
import { BigNumber, FixedNumber } from 'ethers';
import { ExchangeRate } from '@notional-finance/durable-objects';

const secondsInDay = 86400;

const exchangeRatesUSD = new Map<string, ExchangeRate>();

const series: DDMetric[] = [];

const kpis = {
  volume: {},
  accounts: {},
};

let nowSeconds = 0;

async function processLoanVolumes(volumes: DailyLendBorrowVolume[]) {
  // Group the volumes by period
  const lastDay = nowSeconds - secondsInDay;
  const lastWeek = nowSeconds - secondsInDay * 7;
  const lastMonth = nowSeconds - secondsInDay * 30;

  const volumeByPeriod = {
    daily: volumes.filter((v) => v.date > lastDay),
    weekly: volumes.filter((v) => v.date > lastWeek),
    monthly: volumes.filter((v) => v.date > lastMonth),
    total: volumes,
  };

  recordOverallVolume(volumes);
  ['daily', 'weekly', 'monthly'].forEach((period) => {
    recordVolumeByCurrency(volumeByPeriod[period], period);
  });
}

function recordOverallVolume(volumes: DailyLendBorrowVolume[]) {
  const volumeTotal = getLocalVolumeKPI(volumes);
  kpis.volume.overall = Object.keys(volumeTotal).reduce((acc, key) => {
    if (key !== 'decimals') {
      acc[key] = FixedNumber.fromValue(volumeTotal[key], 8).toUnsafeFloat();
    }
    return acc;
  }, {});

  Object.keys(volumeTotal).forEach((key) => {
    if (key === 'decimals') return;
    const overallSeries = {
      metric: `kpi.volume.overall.${key}`,
      tags: [`type:overall`, `chain:mainnet`, `volumeType:${key}}`],
      points: [
        {
          timestamp: nowSeconds,
          value: FixedNumber.fromValue(volumeTotal[key], 8).toUnsafeFloat(),
        },
      ],
    };
    series.push(overallSeries);
  });
}

function getVolumesByCurrency(
  volumes: DailyLendBorrowVolume[]
): Map<string, DailyLendBorrowVolume[]> {
  return volumes.reduce((group, v) => {
    const key = v.currency.underlyingSymbol.toLowerCase();
    if (group.has(key)) {
      group.get(key)!.push(v);
    } else {
      group.set(key, [v]);
    }

    return group;
  }, new Map<string, DailyLendBorrowVolume[]>());
}

function recordVolumeByCurrency(
  volumes: DailyLendBorrowVolume[],
  period: string
) {
  const periodTotal = {
    total: BigNumber.from(0),
    lend: BigNumber.from(0),
    borrow: BigNumber.from(0),
  };
  const kpiPeriod = {};
  const volumeByCurrency = getVolumesByCurrency(volumes);

  [...volumeByCurrency.entries()].forEach(([currency, periodVolume]) => {
    const volumeKPI = getLocalVolumeKPI(periodVolume);
    periodTotal.total = periodTotal.total.add(volumeKPI.total);
    periodTotal.lend = periodTotal.lend.add(volumeKPI.lend);
    periodTotal.borrow = periodTotal.borrow.add(volumeKPI.borrow);
    kpiPeriod[currency] = Object.keys(volumeKPI).reduce((acc, key) => {
      if (key !== 'decimals')
        acc[key] = FixedNumber.fromValue(volumeKPI[key], 8).toUnsafeFloat();
      return acc;
    }, {});

    Object.keys(volumeKPI).forEach((key) => {
      if (key === 'decimals') return;
      const currencySeries = {
        metric: `kpi.volume.${period}.${currency}.${key}`,
        tags: [`type:currency`, `chain:mainnet`, `volumeType:${key}}`],
        points: [
          {
            timestamp: nowSeconds,
            value: FixedNumber.fromValue(volumeKPI[key], 8).toUnsafeFloat(),
          },
        ],
      };
      series.push(currencySeries);
    });
  });

  const overall = Object.keys(periodTotal).reduce((acc, key) => {
    if (key !== 'decimals') {
      acc[key] = FixedNumber.fromValue(periodTotal[key], 8).toUnsafeFloat();
    } else {
      acc[key] = periodTotal[key];
    }
    return acc;
  }, {});
  kpis.volume[period] = { ...kpiPeriod, overall };
}

function getLocalVolumeKPI(volumes: DailyLendBorrowVolume[]): VolumeKPI {
  //calculate the total, lend and borrow volumes in usd
  return volumes.reduce(
    (acc, v) => {
      const localValue = BigNumber.from(v.totalVolumeUnderlyingCash);
      const usdRate = exchangeRatesUSD.get(
        `${v.currency.underlyingSymbol.toLowerCase()}_usd`
      );
      if (!usdRate) throw new Error('No USD rate found for currency');
      const usdValue = localValue
        .mul(usdRate.rate)
        .div(BigNumber.from(10).pow(usdRate.decimals));
      switch (v.tradeType.toLowerCase()) {
        case 'lend':
          acc.lend = acc.lend.add(usdValue);
          break;
        case 'borrow':
          acc.borrow = acc.borrow.add(usdValue);
          break;

        default:
          break;
      }
      acc.total = acc.total.add(usdValue);
      acc.decimals = usdRate?.decimals ?? 8;

      return acc;
    },
    {
      lend: BigNumber.from(0),
      borrow: BigNumber.from(0),
      total: BigNumber.from(0),
    }
  );
}

async function processAccountResults(accounts: Account[]) {
  try {
    const dailyActive = accounts.filter(
      (a) => a.lastUpdateTimestamp > nowSeconds - secondsInDay
    );
    const weeklyActive = accounts.filter(
      (a) => a.lastUpdateTimestamp > nowSeconds - secondsInDay * 7
    );
    const monthlyActive = accounts.filter(
      (a) => a.lastUpdateTimestamp > nowSeconds - secondsInDay * 30
    );

    kpis.accounts = {
      total: {
        overall: accounts.length,
        borrowers: accounts.filter(
          (a) => a.hasCashDebt || a.hasPortfolioAssetDebt
        ).length,
      },
      daily: {
        overall: dailyActive.length,
        borrowers: dailyActive.filter(
          (a) => a.hasCashDebt || a.hasPortfolioAssetDebt
        ).length,
      },
      weekly: {
        overall: weeklyActive.length,
        borrowers: weeklyActive.filter(
          (a) => a.hasCashDebt || a.hasPortfolioAssetDebt
        ).length,
      },
      monthly: {
        overall: monthlyActive.length,
        borrowers: monthlyActive.filter(
          (a) => a.hasCashDebt || a.hasPortfolioAssetDebt
        ).length,
      },
    };

    Object.keys(kpis.accounts).forEach((period) => {
      const { overall, borrowers } = kpis.accounts[period];
      const overallSeries = {
        metric: `kpi.accounts.${period}.overall}`,
        tags: [`period:${period}`, `type:overall`, `chain:mainnet`],
        points: [
          {
            timestamp: nowSeconds,
            value: overall,
          },
        ],
      };
      const borrowerSeries = {
        metric: `kpi.accounts.${period}.borrowers`,
        tags: [`period:${period}`, `type:borrowers`, `chain:mainnet`],
        points: [
          {
            timestamp: nowSeconds,
            value: borrowers,
          },
        ],
      };
      series.push(overallSeries, borrowerSeries);
    });
  } catch (e) {
    console.log(e);
    await log({
      message: (e as Error).message,
      level: 'error',
      chain: 'mainnet',
      action: 'kpi.accounts',
    });
  }
}

function setExchangeRatesUSD(rates: ExchangeRate[]) {
  const usdRates = rates.filter((r) => r.base === 'usd');
  ['usd', 'btc', 'eth'].forEach((base) => {
    const baseRates = rates.filter((r) => r.base === base);
    baseRates.forEach((r) => {
      if (r.base === 'usd') {
        exchangeRatesUSD.set(r.quote, r);
      } else {
        const quoteRate = BigNumber.from(r.value);
        const usdRate = usdRates.find((ur) => ur.quote === r.base);
        if (usdRate) {
          const rate = quoteRate
            .mul(BigNumber.from(usdRate.value))
            .div(BigNumber.from(10).pow(usdRate.decimals));
          exchangeRatesUSD.set(r.quote, { ...r, value: rate });
        }
      }
    });
  });
}

const run = async ({ env }: JobOptions) => {
  try {
    nowSeconds = Math.round(new Date().getTime() / 1000);
    const id = env.EXCHANGE_RATE_STORE.idFromName(
      env.EXCHANGE_RATES_WORKER_NAME
    );
    console.log(`ExchangeRate id: ${id} `);
    const stub = env.EXCHANGE_RATE_STORE.get(id);
    const req = new Request(
      `${env.EXCHANGE_RATE_URL}/exchange-rates?network=homestead`
    );
    const exchangeRateResp = await stub.fetch(req);
    const data = await exchangeRateResp.json();

    if (data && data.results) {
      setExchangeRatesUSD(data.results);
    }

    const mainnet = GraphClient.getClient('mainnet/notional', 0, true);
    const accountsQuery = `{ id lastUpdateTimestamp hasCashDebt hasPortfolioAssetDebt }`;
    const volumeQuery = `{
            id
            date
            tradeType
            marketIndex
            currency {
              id
              symbol
              underlyingSymbol
            }
            totalVolumeUnderlyingCash
          }`;
    const batchedAccountsQuery = GraphClient.buildBatchQuery(
      'accounts',
      accountsQuery
    );
    const batchedVolumeQuery = GraphClient.buildBatchQuery(
      'dailyLendBorrowVolumes',
      volumeQuery
    );
    const [accountsResult, volumesResult] = await Promise.all([
      mainnet.batchQuery(batchedAccountsQuery),
      mainnet.batchQuery(batchedVolumeQuery),
    ]);
    await Promise.all([
      processAccountResults(accountsResult),
      processLoanVolumes(volumesResult),
    ]);
    await submitMetrics(series);
  } catch (e) {
    console.log(e);
    await log({
      message: (e as Error).message,
      level: 'error',
      chain: 'mainnet',
      action: 'kpi',
    });
  }
};

export const kpiMonitorMainnet: MonitorJob = {
  run,
};
