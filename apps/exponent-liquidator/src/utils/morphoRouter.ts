import { ethers, BigNumber, Contract } from 'ethers';
import { aggregate, AggregateCall } from '@notional-finance/multicall';
import { Position, RiskyPosition, HealthFactorData } from '../types';
import { MORPHO_LENDING_ROUTER_ABI } from '../abis';

export class MorphoRouterIntegration {
  private morphoRouterContract: Contract;

  constructor(
    private provider: ethers.providers.Provider,
    morphoRouterAddress: string
  ) {
    this.morphoRouterContract = new ethers.Contract(
      morphoRouterAddress,
      MORPHO_LENDING_ROUTER_ABI,
      provider
    );
  }

  async batchHealthFactors(pairs: Position[]): Promise<HealthFactorData[]> {
    const calls: AggregateCall[] = pairs.map(([account, vault], index) => ({
      stage: 0,
      target: this.morphoRouterContract,
      method: 'healthFactor',
      args: [account, vault],
      key: `health_${index}`,
    }));
    console.log('🏗️  Health factor calls:', calls.length);

    const { results } = await aggregate(calls, this.provider);
    console.log('🏗️  Health factor results:', results);
    const healthFactorData: HealthFactorData[] = [];

    for (let i = 0; i < pairs.length; i++) {
      const [account, vault] = pairs[i];
      const healthData = results[`health_${i}`] as [BigNumber, BigNumber, BigNumber];
      const [borrowed, collateralShares, maxBorrow] = healthData;

      healthFactorData.push({
        account,
        vault,
        borrowed,
        collateralShares,
        maxBorrow,
      });
    }
    console.log('🏗️  Health factor data:', healthFactorData.length);
    return healthFactorData;
  }

  async batchCollateralBalances(positions: RiskyPosition[]): Promise<BigNumber[]> {
    const calls: AggregateCall[] = positions.map((position, index) => ({
      stage: 0,
      target: this.morphoRouterContract,
      method: 'balanceOfCollateral',
      args: [position.account, position.vault],
      key: `balance_${index}`,
    }));

    const { results } = await aggregate(calls, this.provider);

    return positions.map((_, index) => results[`balance_${index}`] as BigNumber);
  }
}