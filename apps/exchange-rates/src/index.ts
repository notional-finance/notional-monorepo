import {
  ExchangeRatesEnv,
  ExchangeRateStore,
} from '@notional-finance/durable-objects';
export { ExchangeRatesEnv, ExchangeRateStore };

export default {
  async fetch(request: Request, env: ExchangeRatesEnv): Promise<Response> {
    const id = env.EXCHANGE_RATE_STORE.idFromName(env.WORKER_NAME);
    const stub = env.EXCHANGE_RATE_STORE.get(id);
    return stub.fetch(request);
  },
};
