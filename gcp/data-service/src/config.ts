import { BalancerBoostedPoolABI } from '@notional-finance/contracts';
import { ethers } from 'ethers';
import { getProviderFromNetwork, Network } from '@notional-finance/util';
import {
  ConfigDefinition,
  SourceType,
  MulticallConfig,
  DataOperations,
  MulticallOperation,
} from './types';
import { GenericDataWriter } from './DataWriter';

export const SourceContracts = {};

export const defaultConfigDefs: ConfigDefinition[] = [
  {
    id: '0xcbfa4532d8b2ade2c261d3dd5ef2a2284f792692:rate',
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0xcbfa4532d8b2ade2c261d3dd5ef2a2284f792692',
      contractABI: BalancerBoostedPoolABI,
      method: 'getRate',
    },
    dataWriter: new GenericDataWriter(),
    dataConfig: {
      decimals: 18,
    },
  },
];

export function buildOperations(
  configDefs: ConfigDefinition[],
  network: Network
): DataOperations {
  const aggregateCalls = new Map<Network, MulticallOperation[]>();
  configDefs.forEach((cfg) => {
    if (cfg.sourceType === SourceType.Multicall) {
      const configData = cfg.sourceConfig as MulticallConfig;
      const contractNetwork = cfg.networkOverride || network;
      let operations = aggregateCalls.get(contractNetwork);
      if (!operations) {
        operations = [];
        aggregateCalls.set(contractNetwork, operations);
      }
      operations.push({
        configDef: cfg,
        aggregateCall: {
          stage: 0,
          target: new ethers.Contract(
            configData.contractAddress,
            configData.contractABI,
            getProviderFromNetwork(cfg.networkOverride || network)
          ),
          method: configData.method,
          key: cfg.id,
        },
      });
    } else if (cfg.sourceType === SourceType.Subgraph) {
      // TODO: implement this
    } else {
      throw Error('Invalid source type');
    }
  });

  return {
    aggregateCalls,
  };
}
