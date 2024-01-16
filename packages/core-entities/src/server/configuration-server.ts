import { TypedDocumentNode } from '@apollo/client/core';
import {
  DocumentTypes,
  loadGraphClientDeferred,
  ServerRegistry,
  TypedDocumentReturnType,
} from './server-registry';
import { getProviderFromNetwork, Network } from '@notional-finance/util';
import { BigNumber, Contract } from 'ethers';
import { SecondaryRewarderABI } from '@notional-finance/contracts';
import { aggregate } from '@notional-finance/multicall';

export type AllConfigurationQuery = TypedDocumentReturnType<
  DocumentTypes['AllConfigurationDocument']
>;

export class ConfigurationServer extends ServerRegistry<AllConfigurationQuery> {
  /** Returns the all configuration query type as is, parsing will be done in the client */
  protected async _refresh(network: Network, blockNumber?: number) {
    const { AllConfigurationDocument, AllConfigurationByBlockDocument } =
      await loadGraphClientDeferred();

    const data = await this._fetchUsingGraph(
      network,
      (blockNumber !== undefined
        ? AllConfigurationByBlockDocument
        : AllConfigurationDocument) as TypedDocumentNode<
        AllConfigurationQuery,
        unknown
      >,
      (r) => {
        return { [network]: r };
      },
      {
        blockNumber,
      }
    );

    const provider = getProviderFromNetwork(network, true);
    const secondaryRewarderCalls = (
      data.values[0][1]?.whitelistedContracts || []
    )
      .filter((s) => s.capability.includes('SecondaryIncentiveRewarder'))
      .flatMap(({ id }) => {
        const rewarder = new Contract(id, SecondaryRewarderABI, provider);
        return [
          {
            key: `${id}.accumulatedRewardPerNToken`,
            target: rewarder,
            method: 'accumulatedRewardPerNToken',
          },
          {
            key: `${id}.lastAccumulatedTime`,
            target: rewarder,
            method: 'lastAccumulatedTime',
          },
        ];
      });

    const { results } = await aggregate(secondaryRewarderCalls, provider);
    data.values[0][1]?.currencyConfigurations.forEach((c) => {
      if (c.incentives?.secondaryIncentiveRewarder) {
        const rewarder = c.incentives?.secondaryIncentiveRewarder;
        if (c.incentives) {
          c.incentives.accumulatedSecondaryRewardPerNToken = (
            results[`${rewarder}.accumulatedRewardPerNToken`] as BigNumber
          ).toString();
          c.incentives.lastSecondaryAccumulatedTime =
            results[`${rewarder}.lastAccumulatedTime`];
        }
      }
    });

    return data;
  }
}
