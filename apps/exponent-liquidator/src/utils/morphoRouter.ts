import { ethers, BigNumber, Contract } from 'ethers';
import { aggregate, AggregateCall } from '@notional-finance/multicall';
import { Position, RiskyPosition } from '../types';

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

  async batchHealthFactors(pairs: Position[]): Promise<RiskyPosition[]> {
    const calls: AggregateCall[] = pairs.map(([account, vault], index) => ({
      stage: 0,
      target: this.morphoRouterContract,
      method: 'healthFactor',
      args: [account, vault],
      key: `health_${index}`,
    }));

    const { results } = await aggregate(calls, this.provider);

    const riskyPositions: RiskyPosition[] = [];

    for (let i = 0; i < pairs.length; i++) {
      const [account, vault] = pairs[i];
      const healthData = results[`health_${i}`] as [BigNumber, BigNumber, BigNumber];
      const [borrowed, collateralValue, maxBorrow] = healthData;

      // Calculate health factor: maxBorrow / borrowed
      let healthFactor: number;
      if (borrowed.isZero()) {
        healthFactor = Number.MAX_SAFE_INTEGER; // No debt = healthy
      } else {
        healthFactor = maxBorrow.mul(1e18).div(borrowed).toNumber() / 1e18;
      }

      // Only include risky positions (healthFactor < 1)
      if (healthFactor < 1) {
        riskyPositions.push({
          account,
          vault,
          borrowed,
          collateralValue,
          maxBorrow,
          healthFactor,
        });
      }
    }

    return riskyPositions;
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