import { providers } from 'ethers';
import { VaultFactory } from '../../vaults';

export default async function getVaultInitParams(
  vaults: {
    strategy: string;
    vaultAddress: string;
    enabled: boolean;
  }[],
  provider: providers.JsonRpcProvider
) {
  const results = (
    await Promise.all(
      vaults
        .filter(({ enabled }) => enabled)
        .map(async ({ strategy, vaultAddress }) => {
          try {
            const { initParams } = await VaultFactory.buildVault(strategy, vaultAddress, provider);
            return {
              vaultAddress,
              initParams: JSON.stringify(initParams),
            };
          } catch (e) {
            console.error(e);
            return undefined;
          }
        })
    )
  ).filter((r) => r !== undefined) as {
    vaultAddress: string;
    initParams: string;
  }[];

  return results.reduce((acc, { vaultAddress, initParams }) => {
    acc[vaultAddress] = initParams;
    return acc;
  }, {} as { [key: string]: string });
}
