import { ethers } from 'ethers';
import { aggregate, AggregateCall } from '@notional-finance/multicall';
import { Network } from '@notional-finance/util';
import {
  VaultConfig,
  OnChainVaultConfig,
  OffChainVaultConfig,
  VaultType,
} from '../types';
import {
  VaultDefaultDexParameters,
  VaultLiquidationSettings,
  DEFAULT_VAULT_LIQUIDATION_SETTINGS,
} from '../configs';
import {
  YieldStrategy__factory,
  AddressRegistry__factory,
  WithdrawRequestManager__factory,
  PendlePT__factory,
  CurveConvex2Token__factory,
} from '@notional-finance/contracts';
import { getContractAddress, getTokenAddress } from '../constants';
import { MorphoRouterIntegration } from './morphoRouter';

export class VaultRegistry {
  private vaultConfigs: Map<string, VaultConfig> = new Map();
  private morphoRouterIntegration: MorphoRouterIntegration;

  private constructor(
    private provider: ethers.providers.Provider,
    private network: Network,
    morphoRouterAddress: string
  ) {
    this.morphoRouterIntegration = new MorphoRouterIntegration(
      provider,
      morphoRouterAddress
    );
  }

  static async initialize(
    vaultAddresses: string[],
    provider: ethers.providers.Provider,
    network: Network,
    morphoRouterAddress: string
  ): Promise<VaultRegistry> {
    const registry = new VaultRegistry(provider, network, morphoRouterAddress);
    await registry.loadVaultConfigs(vaultAddresses);
    return registry;
  }

  getVaultConfig(vaultAddress: string): VaultConfig | undefined {
    return this.vaultConfigs.get(vaultAddress.toLowerCase());
  }

  private async loadVaultConfigs(vaultAddresses: string[]): Promise<void> {
    // Get unique vault addresses
    const uniqueVaults = [
      ...new Set(vaultAddresses.map((addr) => addr.toLowerCase())),
    ];

    // Batch fetch on-chain data for all vaults
    const onChainConfigs = await this.batchFetchOnChainData(uniqueVaults);

    // Merge with off-chain data
    for (let i = 0; i < uniqueVaults.length; i++) {
      const vaultAddress = uniqueVaults[i];
      const onChainConfig = onChainConfigs[i];
      const offChainConfig = this.getOffChainConfig(vaultAddress);

      const fullConfig: VaultConfig = {
        address: vaultAddress,
        ...onChainConfig,
        ...offChainConfig,
      };

      this.vaultConfigs.set(vaultAddress, fullConfig);
    }
  }

  private async batchFetchOnChainData(
    vaultAddresses: string[]
  ): Promise<OnChainVaultConfig[]> {
    const addressRegistryContract = AddressRegistry__factory.connect(
      getContractAddress(this.network, 'ADDRESS_REGISTRY')!,
      this.provider
    );

    // Add base vault calls for each vault
    const calls: AggregateCall[] = vaultAddresses.flatMap((vaultAddress) => {
      const vaultContract = YieldStrategy__factory.connect(
        vaultAddress,
        this.provider
      );
      return [
        {
          target: vaultContract,
          stage: 0,
          method: 'strategy',
          key: `${vaultAddress}.strategy`,
        },
        {
          target: vaultContract,
          stage: 0,
          method: 'asset',
          key: `${vaultAddress}.asset`,
        },
        {
          target: vaultContract,
          stage: 0,
          method: 'yieldToken',
          key: `${vaultAddress}.yieldToken`,
        },
        {
          target: vaultContract,
          stage: 0,
          method: 'convertSharesToYieldToken',
          args: [ethers.utils.parseUnits('1', 24)], // 1e24
          key: `${vaultAddress}.shareToYieldTokenExchangeRate`,
        },
      ];
    });

    // Execute first stage to get basic vault data
    const { results } = await aggregate(calls, this.provider);

    // Prepare additional calls based on vault types
    const vaultConfigs: Partial<OnChainVaultConfig>[] = vaultAddresses.map(
      (vaultAddress) => {
        return {
          vaultType: results[`${vaultAddress}.strategy`] as VaultType,
          asset: results[`${vaultAddress}.asset`] as string,
          yieldToken: results[`${vaultAddress}.yieldToken`] as string,
          shareToYieldTokenExchangeRate: results[
            `${vaultAddress}.shareToYieldTokenExchangeRate`
          ] as ethers.BigNumber,
        };
      }
    );

    const additionalCalls: AggregateCall[] = vaultAddresses.flatMap(
      (vaultAddress) => {
        const vaultType = results[`${vaultAddress}.strategy`] as VaultType;

        if (vaultType === VaultType.Staking) {
          return [
            {
              target: addressRegistryContract as ethers.Contract,
              stage: 1,
              method: 'withdrawRequestManagers',
              args: [results[`${vaultAddress}.yieldToken`] as string],
              key: `${vaultAddress}.primaryWrm`,
            },
          ];
        } else if (vaultType === VaultType.PendlePT) {
          const pendlePtContract = PendlePT__factory.connect(
            vaultAddress,
            this.provider
          );
          return [
            {
              target: pendlePtContract as ethers.Contract,
              stage: 1,
              method: 'TOKEN_OUT_SY',
              key: `${vaultAddress}.tokenOutSy`,
            },
            {
              target: pendlePtContract as ethers.Contract,
              stage: 1,
              method: 'MARKET',
              key: `${vaultAddress}.marketAddress`,
            },
            {
              target: pendlePtContract as ethers.Contract,
              stage: 1,
              method: 'PT',
              key: `${vaultAddress}.ptAddress`,
            },
          ];
        } else if (vaultType === VaultType.CurveConvex2Token) {
          const curveConvexContract = CurveConvex2Token__factory.connect(
            vaultAddress,
            this.provider
          );
          return [
            {
              target: curveConvexContract as ethers.Contract,
              stage: 1,
              method: 'TOKENS',
              key: `${vaultAddress}.tokens`,
            },
            {
              target: curveConvexContract as ethers.Contract,
              stage: 1,
              method: 'PRIMARY_INDEX',
              key: `${vaultAddress}.primaryIndex`,
            },
          ];
        }
        return [];
      }
    );

    // Add additional calls to the existing calls array
    calls.push(...additionalCalls);

    // Execute again to get vault-specific data
    const { results: results2 } = await aggregate(calls, this.provider);

    // Enrich vault configs with stage 2 data
    const enrichedVaultConfigs = vaultAddresses.map((vaultAddress, i) => {
      const config = vaultConfigs[i];

      if (config.vaultType === VaultType.Staking) {
        return {
          ...config,
          primaryWrm: results2[`${vaultAddress}.primaryWrm`] as string,
        };
      } else if (config.vaultType === VaultType.PendlePT) {
        return {
          ...config,
          tokenOutSy: results2[`${vaultAddress}.tokenOutSy`] as string,
          marketAddress: results2[`${vaultAddress}.marketAddress`] as string,
          ptAddress: results2[`${vaultAddress}.ptAddress`] as string,
        };
      } else if (config.vaultType === VaultType.CurveConvex2Token) {
        const tokens = results2[`${vaultAddress}.tokens`] as [string, string];
        const primaryIndex = results2[
          `${vaultAddress}.primaryIndex`
        ] as ethers.BigNumber;
        const token0 =
          tokens[0] === ethers.constants.AddressZero
            ? getTokenAddress(this.network, 'WETH')!
            : tokens[0];
        const token1 =
          tokens[1] === ethers.constants.AddressZero
            ? getTokenAddress(this.network, 'WETH')!
            : tokens[1];

        return {
          ...config,
          token0,
          token1,
          primaryIndex: primaryIndex.toNumber(),
        };
      }
      return config;
    });

    // Prepare stage 3 calls based on enriched configs
    const finalCalls: AggregateCall[] = vaultAddresses.flatMap(
      (vaultAddress, i) => {
        const config = enrichedVaultConfigs[i];

        if (config.vaultType === VaultType.Staking) {
          const wrmContract = WithdrawRequestManager__factory.connect(
            config.primaryWrm!,
            this.provider
          );
          return [
            {
              target: wrmContract as ethers.Contract,
              stage: 2,
              method: 'WITHDRAW_TOKEN',
              key: `${vaultAddress}.primaryWithdrawToken`,
            },
          ];
        } else if (config.vaultType === VaultType.PendlePT) {
          return [
            {
              target: addressRegistryContract as ethers.Contract,
              stage: 2,
              method: 'withdrawRequestManagers',
              args: [config.tokenOutSy!],
              key: `${vaultAddress}.primaryWrm`,
            },
          ];
        } else if (config.vaultType === VaultType.CurveConvex2Token) {
          return [
            {
              target: addressRegistryContract as ethers.Contract,
              stage: 2,
              method: 'withdrawRequestManagers',
              args: [config.token0!],
              key: `${vaultAddress}.primaryWrm`,
            },
            {
              target: addressRegistryContract as ethers.Contract,
              stage: 2,
              method: 'withdrawRequestManagers',
              args: [config.token1!],
              key: `${vaultAddress}.secondaryWrm`,
            },
          ];
        }
        return [];
      }
    );

    // Add final calls and execute to get WRM addresses
    calls.push(...finalCalls);
    const { results: results3 } = await aggregate(calls, this.provider);

    // Enrich vault configs with stage 3 data
    const enrichedVaultConfigs2 = vaultAddresses.map((vaultAddress, i) => {
      const config = enrichedVaultConfigs[i];

      if (config.vaultType === VaultType.Staking) {
        return {
          ...config,
          primaryWithdrawToken: results3[
            `${vaultAddress}.primaryWithdrawToken`
          ] as string,
        };
      } else if (config.vaultType === VaultType.PendlePT) {
        return {
          ...config,
          primaryWrm: results3[`${vaultAddress}.primaryWrm`] as string,
        };
      } else if (config.vaultType === VaultType.CurveConvex2Token) {
        return {
          ...config,
          primaryWrm: results3[`${vaultAddress}.primaryWrm`] as string,
          secondaryWrm: results3[`${vaultAddress}.secondaryWrm`] as string,
        };
      }
      return config;
    });

    // Prepare stage 4 calls based on enriched configs
    const withdrawTokenCalls: AggregateCall[] = vaultAddresses.flatMap(
      (vaultAddress, i) => {
        const config = enrichedVaultConfigs2[i];

        if (config.vaultType === VaultType.PendlePT) {
          const primaryWrmContract = WithdrawRequestManager__factory.connect(
            config.primaryWrm!,
            this.provider
          );
          return [
            {
              target: primaryWrmContract,
              stage: 3,
              method: 'WITHDRAW_TOKEN',
              key: `${vaultAddress}.primaryWithdrawToken`,
            },
          ];
        } else if (config.vaultType === VaultType.CurveConvex2Token) {
          const primaryWrmContract = WithdrawRequestManager__factory.connect(
            config.primaryWrm!,
            this.provider
          );
          const secondaryWrmContract = WithdrawRequestManager__factory.connect(
            config.secondaryWrm!,
            this.provider
          );
          return [
            {
              target: primaryWrmContract,
              stage: 3,
              method: 'WITHDRAW_TOKEN',
              key: `${vaultAddress}.primaryWithdrawToken`,
            },
            {
              target: secondaryWrmContract,
              stage: 3,
              method: 'WITHDRAW_TOKEN',
              key: `${vaultAddress}.secondaryWithdrawToken`,
            },
          ];
        }
        return [];
      }
    );

    // Execute final calls to get withdraw tokens if needed
    let finalEnrichedConfigs: Partial<OnChainVaultConfig>[];

    if (withdrawTokenCalls.length > 0) {
      calls.push(...withdrawTokenCalls);
      const { results: finalResults } = await aggregate(calls, this.provider);

      // Enrich vault configs with stage 4 data (withdraw tokens)
      finalEnrichedConfigs = vaultAddresses.map((vaultAddress, i) => {
        const config = enrichedVaultConfigs2[i];

        if (config.vaultType === VaultType.PendlePT) {
          return {
            ...config,
            primaryWithdrawToken: finalResults[
              `${vaultAddress}.primaryWithdrawToken`
            ] as string,
          };
        } else if (config.vaultType === VaultType.CurveConvex2Token) {
          return {
            ...config,
            primaryWithdrawToken: finalResults[
              `${vaultAddress}.primaryWithdrawToken`
            ] as string,
            secondaryWithdrawToken: finalResults[
              `${vaultAddress}.secondaryWithdrawToken`
            ] as string,
          };
        }
        return config;
      });
    } else {
      // Use enrichedVaultConfigs2 as the latest
      finalEnrichedConfigs = enrichedVaultConfigs2;
    }

    // Fetch liquidation incentive factors for all vaults
    const liquidationIncentiveFactors =
      await this.morphoRouterIntegration.batchLiquidationIncentiveFactors(
        vaultAddresses
      );

    // Add liquidation incentive factors and return final configs
    return finalEnrichedConfigs.map((config, i) => ({
      ...config,
      liquidationIncentiveFactor: liquidationIncentiveFactors.get(
        vaultAddresses[i]
      ),
    })) as OnChainVaultConfig[];
  }

  private getOffChainConfig(vaultAddress: string): OffChainVaultConfig {
    const lowerAddress = vaultAddress.toLowerCase();

    // Get DEX parameters
    const dexParams = VaultDefaultDexParameters[this.network]?.[lowerAddress];

    // Get liquidation settings and merge with defaults
    const liquidationOverrides =
      VaultLiquidationSettings[this.network]?.[lowerAddress];
    const liquidationSettings = {
      ...DEFAULT_VAULT_LIQUIDATION_SETTINGS,
      ...liquidationOverrides,
    };

    return {
      dexId: dexParams?.dexId,
      redeemExchangeData: dexParams?.redeemExchangeData?.toString(),
      withdrawExchangeData: dexParams?.withdrawExchangeData?.toString(),
      redeemPoolAddress: dexParams?.redeemPoolAddress,
      withdrawPoolAddress: dexParams?.withdrawPoolAddress,
      liquidateYieldTokens: liquidationSettings.liquidateYieldTokens,
      slippageLimit: liquidationSettings.slippageLimit,
      ptSlippageLimit: liquidationSettings.ptSlippageLimit,
    };
  }
}
