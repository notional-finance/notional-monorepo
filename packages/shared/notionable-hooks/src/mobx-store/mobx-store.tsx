// import { Registry } from '@notional-finance/core-entities';
import { GlobalState } from '@notional-finance/notionable';
import { Network, THEME_VARIANTS } from '@notional-finance/util';
import { makeObservable, observable } from 'mobx';

const CACHE_HOSTNAME =
  process.env['NX_DATA_URL'] || 'https://data-dev.notional.finance';

export class MobxStore {
  initialGlobalState: GlobalState = {
    cacheHostname: CACHE_HOSTNAME,
    themeVariant: THEME_VARIANTS.LIGHT,
    baseCurrency: 'USD',
    isSanctionedAddress: false,
    isAccountPending: false,
    sentTransactions: [],
    completedTransactions: {},
    pendingPnL: {
      [Network.all]: [],
      [Network.mainnet]: [],
      [Network.arbitrum]: [],
      [Network.optimism]: [],
    },
  };

  // TODO: Attempt to move only the data needed to render the landing page into the MobxStore
  // - Look at the global-manage.ts file to see what data is needed
  // - specifically on-date-update.ts - onAnalyticsReady$
  // - heroStats: Registry.getAnalyticsRegistry().getKPIs(),

  constructor() {
    makeObservable(this, {
      initialGlobalState: observable,
    });
  }

  // heroKPIs: Registry.getAnalyticsRegistry().getKPIs()
  // productsData: on-date-update.ts - onYieldsUpdate$
}
