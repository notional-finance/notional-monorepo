import {
  BalancerBoostedPoolABI,
  BalancerVault,
  BalancerVaultABI,
  ISingleSidedLPStrategyVaultABI,
} from '@notional-finance/contracts';
import { aggregate } from '@notional-finance/multicall';
import { Network, getProviderFromNetwork } from '@notional-finance/util';
import { BigNumber, Contract, ethers, providers } from 'ethers';

const VaultConfig = {
  '0x32d82a1c8618c7be7fe85b2f1c44357a871d52d1': {
    poolId: 'aaa',
    targetToken: 'bbb',
  },
};

const vaultShares = `
query VaultShares($blockNumber: Int!, $vaultAddress: Bytes!) {
  balances(
    where: {token_: {vaultAddress: $vaultAddress, tokenType: VaultShare }}
    block: {number: $blockNumber}
  ) {
    id
    account {
      id
    }
    current {
      currentBalance
    }
  }
}`;

async function getVaultData(
  network: Network,
  vaultAddress: string,
  blockNumber: number
) {
  const { targetToken, poolId } = VaultConfig[vaultAddress];

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
        target: new Contract('A', BalancerVaultABI),
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

  const allVaultAccounts = fetchUsingGraph(network, vaultAddress, blockNumber);

  const totalLPTokens = vaultInfo.info['totalLPTokens'];
  const totalVaultShares = vaultInfo.info['totalVaultShares'];
  const totalLPSupply = poolData.totalSupply;
  const tokenIndex = poolData.balances.tokens.findIndex(
    (t) => t === targetToken
  );
  const totalTokenBalance = poolData.balances.balances[tokenIndex];

  return allVaultAccounts.map((a) => {
    const lpTokens = totalLPTokens.mul(vaultShares).div(totalVaultShares);
    const weETHBalance = totalTokenBalance.mul(lpTokens).div(totalLPSupply);

    return {
      address: a.account,
      effective_balance: `${ethers.utils.formatUnits(weETHBalance, 18)} weETH`,
    };
  });
}
