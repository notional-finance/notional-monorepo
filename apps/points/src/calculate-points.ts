import {
  BalancerBoostedPoolABI,
  BalancerVault,
  BalancerVaultABI,
  IAggregator,
  IAggregatorABI,
  ISingleSidedLPStrategyVault,
  ISingleSidedLPStrategyVaultABI,
} from '@notional-finance/contracts';
import { fetchGraphPaginate } from '@notional-finance/core-entities';
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
    // rETH borrow
    decimals: 18,
    usdOracle: '0xA7D273951861CF07Df8B0A1C3c934FD41bA9E8Eb',
  },
  '0x914255c0c289aea36e378ebb5e28293b5ed278ca': {
    poolId:
      '0x596192bb6e41802428ac943d2f1476c1af25cc0e000000000000000000000659',
    targetToken: '0xbf5495Efe5DB9ce00f80364C8B423567e58d2110',
    network: Network.mainnet,
    symbol: 'ezETH',
    decimals: 8,
    // ETH borrow
    usdOracle: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
  },
  '0xd7c3dc1c36d19cf4e8cea4ea143a2f4458dd1937': {
    poolId:
      '0xb61371ab661b1acec81c699854d2f911070c059e000000000000000000000516',
    targetToken: '0x2416092f143378750bb29b79eD961ab195CcEea5',
    network: Network.arbitrum,
    symbol: 'ezETH',
    decimals: 18,
    // wstETH borrow
    usdOracle: '0x29aFB1043eD699A89ca0F0942ED6F6f65E794A3d',
  },
};

async function loadAllVaultsQuery(
  vaultAddress: string,
  blockNumber: number,
  network: Network,
  apiKey: string
) {
  const {
    AllVaultAccountsDocument,
    // eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
  } = await import('../../../packages/core-entities/src/.graphclient/index');

  return await fetchGraphPaginate(
    network,
    AllVaultAccountsDocument,
    'balances',
    {
      vaultAddress,
      blockNumber,
    },
    apiKey
  ).then((d) => d.data as AllVaultAccountsQuery);
}

async function getVaultInfo(
  vaultAddress: string,
  network: Network,
  blockNumber: number
) {
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
      info: Awaited<
        ReturnType<
          ISingleSidedLPStrategyVault['functions']['getStrategyVaultInfo']
        >
      >[number];
    };
  };

  return vaultInfo;
}

export async function getVaultTVL(vaultAddress: string) {
  const { network, usdOracle, decimals } = VaultConfig[vaultAddress];
  const provider = getProviderFromNetwork(network, true);
  const vault = new Contract(
    vaultAddress,
    ISingleSidedLPStrategyVaultABI,
    provider
  ) as ISingleSidedLPStrategyVault;
  const totalVaultShares = (await vault.getStrategyVaultInfo())
    .totalVaultShares;
  const totalValuePrimary = await vault.convertStrategyToUnderlying(
    ethers.constants.AddressZero,
    totalVaultShares,
    0
  );
  const usdOraclePrice = await (
    new Contract(usdOracle, IAggregatorABI, provider) as IAggregator
  ).latestAnswer();
  const rateDecimals = BigNumber.from(10).pow(decimals);

  return {
    vaultAddress,
    tvlUSD: ethers.utils.formatUnits(
      totalValuePrimary.mul(usdOraclePrice).div(rateDecimals),
      18
    ),
  };
}

export async function getVaultData(
  vaultAddress: string,
  blockNumber: number,
  apiKey: string
) {
  const { targetToken, poolId, network, symbol } = VaultConfig[vaultAddress];

  const vaultInfo = await getVaultInfo(vaultAddress, network, blockNumber);

  const { results: poolData } = (await aggregate<{
    totalSupply: BigNumber;
    balances: Awaited<ReturnType<BalancerVault['functions']['getPoolTokens']>>;
  }>(
    [
      {
        stage: 0,
        target: new Contract(vaultInfo.info.pool, BalancerBoostedPoolABI),
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
    network,
    apiKey
  );

  const totalLPTokens = vaultInfo.info.totalLPTokens;
  const totalVaultShares = vaultInfo.info.totalVaultShares;
  const totalLPSupply = poolData.totalSupply;
  const tokenIndex = poolData.balances.tokens.findIndex(
    (t) => t === targetToken
  );
  const totalTokenBalance = poolData.balances.balances[tokenIndex];

  return allVaultAccounts.balances
    .filter((a) => !BigNumber.from(a.current.currentBalance).isZero())
    .map((a) => {
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
