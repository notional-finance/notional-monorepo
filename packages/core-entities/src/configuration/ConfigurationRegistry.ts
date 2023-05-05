import { AggregateCall } from '@notional-finance/multicall';
import { BehaviorSubject } from 'rxjs';
import { Network } from '..';
import { BaseCachable } from '../registry/BaseRegistry';

interface ProtocolConfig {
  configValues: Map<string, BehaviorSubject<unknown | undefined>>;
  configCalls: AggregateCall[];
}

export class ConfigurationRegistry extends BaseCachable {
  protected static configRegistry = new Map<
    Network,
    Map<Protocol, ProtocolConfig>
  >(
    defaultConfiguration.map(([n, _configs]) => {
      const networkConfigs = new Map<Protocol, ProtocolConfig>(
        _configs.map(([protocol, configCalls]) => {
          return [
            protocol,
            {
              configValues: new Map<
                string,
                BehaviorSubject<unknown | undefined>
              >(
                configCalls.map(({ key }) => [
                  key,
                  new BehaviorSubject<unknown | undefined>(),
                ])
              ),
              configCalls,
            },
          ];
        })
      );

      return [n, networkConfigs];
    })
  );

  public static serializeToCache(network: Network) {
    const { subjects } = this.getOracleGraph(network);
    return this._serializeToCache<ExchangeRate>(network, subjects);
  }

  public static async fetchFromCache(network: Network) {
    const { subjects } = this.getOracleGraph(network);
    return this._fetchFromCache<ExchangeRate>(subjects, '/oracles');
  }
}
