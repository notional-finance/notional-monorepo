import { JobOptions, MonitorJob, VolumeKPI } from './types';
import GraphClient, {
  Account,
  DailyLendBorrowVolume,
  CurrencyQuery,
  Currency,
  CurrencyTvlsQuery,
} from '@notional-finance/graph-client';
import { log, submitMetrics } from '@notional-finance/logging';
import { DDMetric } from '@notional-finance/logging';
import { BigNumber, FixedNumber } from 'ethers';
import { ExchangeRate } from '@notional-finance/durable-objects';

const secondsInDay = 86400;
const mainnet = GraphClient.getClient('mainnet/notional', 0, true);
const exchangeRatesUSD = new Map<string, ExchangeRate>();

const series: DDMetric[] = [];

const kpis = {
  volume: {},
  accounts: {},
  tvl: {},
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
      const currency = `${v.currency.underlyingSymbol.toLowerCase()}`;
      const usdRate = exchangeRatesUSD.get(currency);
      if (!usdRate) throw new Error(`No USD rate found for ${currency}`);
      const usdValue = localValue
        .mul(usdRate.value)
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
        exchangeRatesUSD.set(r.quote, { ...r, value: BigNumber.from(r.value) });
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

async function processTVL(currencies: Currency[]) {
  const tvls = await Promise.all(
    currencies.map(async (c): [string, number] => {
      const { id, underlyingSymbol } = c;
      const {
        currencyTvls: [cTvl],
      } = await mainnet.queryOrThrow(CurrencyTvlsQuery, {
        currencyId: id,
      });

      return [
        underlyingSymbol,
        FixedNumber.fromValue(BigNumber.from(cTvl.usdValue), 8).toUnsafeFloat(),
      ];
    })
  );
  const tvl = tvls.reduce(
    (acc, [symbol, usdValue]) => {
      const total = acc.total + usdValue;
      return { ...acc, total, [symbol]: usdValue };
    },
    { total: 0 }
  );
  kpis.tvl = { ...tvl };
}

const run = async ({ env }: JobOptions) => {
  try {
    nowSeconds = Math.round(new Date().getTime() / 1000);
    const kpisId = env.KPIS_DO.idFromName(env.KPIS_NAME);
    const kpisStub = env.KPIS_DO.get(kpisId);

    const ratesId = env.EXCHANGE_RATES_DO.idFromName(env.EXCHANGE_RATES_NAME);
    const ratesStub = env.EXCHANGE_RATES_DO.get(ratesId);
    const ratesReq = new Request(
      `http://${env.EXCHANGE_RATES_NAME}/exchange-rates?network=mainnet`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    const exchangeRateResp = await ratesStub.fetch(ratesReq);

    if (!exchangeRateResp.ok) {
      throw new Error("Couldn't fetch exchange rates");
    }
    const data = await exchangeRateResp.json();

    if (data && data.results) {
      setExchangeRatesUSD(data.results);
    }

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
    const [accountsResult, volumesResult, currenciesResult] = await Promise.all(
      [
        mainnet.batchQuery(batchedAccountsQuery),
        mainnet.batchQuery(batchedVolumeQuery),
        mainnet.queryOrThrow(CurrencyQuery),
      ]
    );

    await Promise.all([
      processAccountResults(accountsResult),
      processLoanVolumes(volumesResult),
      processTVL(currenciesResult.currencies),
    ]);
    await submitMetrics(series);

    const kpisReq = new Request(
      `http://${env.KPIS_NAME}/kpis?network=mainnet`,
      {
        body: JSON.stringify({ kpis }),
        method: 'PUT',
      }
    );
    await kpisStub.fetch(kpisReq);
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
