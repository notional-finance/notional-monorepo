import { ethers, BigNumber, Contract } from 'ethers';
import { aggregate, AggregateCall } from '@notional-finance/multicall';
import { Position, RiskyPosition, HealthFactorData } from '../types';
import { MORPHO_LENDING_ROUTER_ABI } from '../abis';

// Math utility functions adapted for BigNumber
const WAD = ethers.utils.parseUnits('1', 18);
const LIQUIDATION_CURSOR = ethers.utils.parseUnits('0.3', 18); // 3e17
const MAX_LIQUIDATION_INCENTIVE_FACTOR = ethers.utils.parseUnits('1.15', 18); // 115e16

const min = (a: BigNumber, b: BigNumber): BigNumber => (a.lt(b) ? a : b);

const wMulDown = (x: BigNumber, y: BigNumber): BigNumber => {
  return x.mul(y).div(WAD);
};

const wDivDown = (x: BigNumber, y: BigNumber): BigNumber => {
  return x.mul(WAD).div(y);
};

const incentiveFactor = (lltv: BigNumber): BigNumber => {
  const wadMinusLltv = WAD.sub(lltv);
  const cursorMultiplied = wMulDown(LIQUIDATION_CURSOR, wadMinusLltv);
  const denominator = WAD.sub(cursorMultiplied);
  const calculated = wDivDown(WAD, denominator);
  return min(MAX_LIQUIDATION_INCENTIVE_FACTOR, calculated);
};

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
      transform: (healthData: [BigNumber, BigNumber, BigNumber]) => {
        const [borrowed, , maxBorrow] = healthData;
        let healthFactor: number;
        if (borrowed.isZero()) {
          healthFactor = Number.MAX_SAFE_INTEGER; // No debt = healthy
        } else {
          healthFactor = maxBorrow
            .mul(ethers.utils.parseUnits('1', 18))
            .div(borrowed)
            .div(ethers.utils.parseUnits('1', 18))
            .toNumber();
        }
        return {
          account,
          vault,
          borrowed,
          maxBorrow,
          healthFactor,
        };
      },
    }));
    console.log('🏗️  Health factor calls:', calls.length);

    const { results } = await aggregate(calls, this.provider);
    console.log('🏗️  Health factor results:', results);

    const healthFactorData = pairs.map(
      (_, index) => results[`health_${index}`] as HealthFactorData
    );
    console.log('🏗️  Health factor data:', healthFactorData.length);
    return healthFactorData;
  }

  async batchCollateralBalances(
    positions: RiskyPosition[]
  ): Promise<BigNumber[]> {
    const calls: AggregateCall[] = positions.map((position, index) => ({
      stage: 0,
      target: this.morphoRouterContract,
      method: 'balanceOfCollateral',
      args: [position.account, position.vault],
      key: `balance_${index}`,
    }));

    const { results } = await aggregate(calls, this.provider);

    return positions.map(
      (_, index) => results[`balance_${index}`] as BigNumber
    );
  }

  async batchBorrowShareBalances(positions: Position[]): Promise<BigNumber[]> {
    const calls: AggregateCall[] = positions.map(([account, vault], index) => ({
      stage: 0,
      target: this.morphoRouterContract,
      method: 'balanceOfBorrowShares',
      args: [account, vault],
      key: `borrowShares_${index}`,
    }));

    console.log('🏗️  Borrow share balance calls:', calls.length);
    const { results } = await aggregate(calls, this.provider);
    console.log('🏗️  Borrow share balance results:', results);

    return positions.map(
      (_, index) => results[`borrowShares_${index}`] as BigNumber
    );
  }

  async batchLiquidationIncentiveFactors(
    vaultAddresses: string[]
  ): Promise<Map<string, BigNumber>> {
    const calls: AggregateCall[] = vaultAddresses.map((vault, index) => ({
      stage: 0,
      target: this.morphoRouterContract,
      method: 'marketParams',
      args: [vault],
      key: `incentiveFactor_${index}`,
      transform: (
        marketParamsResult: [string, string, string, string, BigNumber]
      ) => {
        const [, , , , lltv] = marketParamsResult;

        const liquidationIncentiveFactor = incentiveFactor(lltv);

        console.log(
          `🏗️  Vault ${vault} LLTV: ${lltv.toString()}, Incentive Factor: ${liquidationIncentiveFactor.toString()}`
        );

        return liquidationIncentiveFactor;
      },
    }));

    console.log('🏗️  Market params calls:', calls.length);
    const { results } = await aggregate(calls, this.provider);
    console.log('🏗️  Incentive factor results:', results);

    const liquidationIncentiveFactors = new Map<string, BigNumber>();
    vaultAddresses.forEach((vault, index) => {
      liquidationIncentiveFactors.set(
        vault,
        results[`incentiveFactor_${index}`] as BigNumber
      );
    });

    return liquidationIncentiveFactors;
  }
}
