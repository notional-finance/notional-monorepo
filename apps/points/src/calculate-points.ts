import {
  BalancerBoostedPoolABI,
  BalancerVault,
  BalancerVaultABI,
  ISingleSidedLPStrategyVaultABI,
} from '@notional-finance/contracts';
import { aggregate } from '@notional-finance/multicall';
import { Network, getProviderFromNetwork } from '@notional-finance/util';
import { BigNumber, Contract, ethers, providers } from 'ethers';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { AllVaultAccountsQuery } from 'packages/core-entities/src/.graphclient';

const VaultConfig = {
  '0x32d82a1c8618c7be7fe85b2f1c44357a871d52d1': {
    poolId:
      '0x05ff47afada98a98982113758878f9a8b9fdda0a000000000000000000000645',
    targetToken: '0xCd5fE23C85820F7B72D0926FC9b05b43E359b7ee',
    network: Network.mainnet,
    symbol: 'weETH',
  },
  '0x914255c0c289aea36e378ebb5e28293b5ed278ca': {
    poolId:
      '0x596192bb6e41802428ac943d2f1476c1af25cc0e000000000000000000000659',
    targetToken: '0xbf5495Efe5DB9ce00f80364C8B423567e58d2110',
    network: Network.mainnet,
    symbol: 'ezETH',
  },
};

async function loadAllVaultsQuery(
  vaultAddress: string,
  blockNumber: number,
  network: Network
) {
  const {
    execute,
    AllVaultAccountsDocument,
    // eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
  } = await import('../../../packages/core-entities/src/.graphclient/index');

  return await execute(
    AllVaultAccountsDocument,
    {
      vaultAddress,
      blockNumber,
    },
    { chainName: network }
  ).then((d) => d.data as AllVaultAccountsQuery);
}

export async function getVaultData(vaultAddress: string, blockNumber: number) {
  const { targetToken, poolId, network, symbol } = VaultConfig[vaultAddress];

  const { results: vaultInfo } = (await aggregate<unknown>(
    [
      {
        target: new Contract(
          vaultAddress,
          ISingleSidedLPStrategyVaultABI,
          getProviderFromNetwork(network)
        ),
        method: 'getStrategyVaultInfo',
        key: 'info',
      },
    ],
    getProviderFromNetwork(network, true),
    blockNumber
  )) as unknown as {
    block: providers.Block;
    results: {
      info: Awaited<ReturnType<BalancerVault['functions']['getPoolTokens']>>;
    };
  };

  const { results: poolData } = (await aggregate<{
    totalSupply: BigNumber;
    balances: Awaited<ReturnType<BalancerVault['functions']['getPoolTokens']>>;
  }>(
    [
      {
        stage: 0,
        target: new Contract(vaultInfo.info['pool'], BalancerBoostedPoolABI),
        method: 'getActualSupply',
        key: 'totalSupply',
        args: [],
      },
      {
        target: new Contract(
          '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
          BalancerVaultABI
        ),
        method: 'getPoolTokens',
        args: [poolId],
        key: 'balances',
      },
    ],
    getProviderFromNetwork(network, true),
    blockNumber
  )) as unknown as {
    block: providers.Block;
    results: {
      totalSupply: BigNumber;
      balances: Awaited<
        ReturnType<BalancerVault['functions']['getPoolTokens']>
      >;
    };
  };

  const allVaultAccounts = await loadAllVaultsQuery(
    vaultAddress,
    blockNumber,
    network
  );

  const totalLPTokens: BigNumber = vaultInfo.info['totalLPTokens'];
  const totalVaultShares: BigNumber = vaultInfo.info['totalVaultShares'];
  const totalLPSupply: BigNumber = poolData.totalSupply;
  const tokenIndex = poolData.balances.tokens.findIndex(
    (t) => t === targetToken
  );
  const totalTokenBalance: BigNumber = poolData.balances.balances[tokenIndex];

  return allVaultAccounts.balances.map((a) => {
    const lpTokens = totalLPTokens
      .mul(BigNumber.from(a.current.currentBalance))
      .div(totalVaultShares);
    const tokenBalance = totalTokenBalance.mul(lpTokens).div(totalLPSupply);

    return {
      address: a.account.id,
      effective_balance: `${ethers.utils.formatUnits(
        tokenBalance,
        18
      )} ${symbol}`,
    };
  });
}
