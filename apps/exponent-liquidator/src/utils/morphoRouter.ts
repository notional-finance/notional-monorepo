import { ethers, BigNumber, Contract } from 'ethers';
import { aggregate, AggregateCall } from '@notional-finance/multicall';
import { Position, RiskyPosition, HealthFactorData } from '../types';

// TODO: Replace with actual Morpho ABI when provided
const MORPHO_LENDING_ROUTER_ABI = [
  'function healthFactor(address account, address vault) external view returns (uint256 borrowed, uint256 collateralValue, uint256 maxBorrow)',
  'function balanceOfCollateral(address account, address vault) external view returns (uint256 shares)'
];

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

    const { results } = await aggregate(calls, this.provider);

    const healthFactorData: HealthFactorData[] = [];

    for (let i = 0; i < pairs.length; i++) {
      const [account, vault] = pairs[i];
      const healthData = results[`health_${i}`] as [BigNumber, BigNumber, BigNumber];
      const [borrowed, collateralValue, maxBorrow] = healthData;

      healthFactorData.push({
        account,
        vault,
        borrowed,
        collateralValue,
        maxBorrow,
      });
    }

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