import {
  AddressRegistryABI,
  ERC20ABI,
  LendingRouterABI,
  MorphoABI,
} from '@notional-finance/contracts';
import {
  ADDRESS_REGISTRY,
  MAX_APPROVAL,
  MorphoRouter,
  Network,
  ZERO_ADDRESS,
  getNowSeconds,
} from '@notional-finance/util';
import { BigNumber, Contract, providers } from 'ethers';
import {
  AggregateCall,
  NO_OP,
  aggregate,
  getMulticall,
} from '@notional-finance/multicall';
import { TokenBalance } from '../../token-balance';
import {
  AccountDefinition,
  StakeNoteStatus,
  TokenDefinition,
} from '../../Definitions';
import { fetchUsingMulticall } from '../../server/server-registry';
import { SNOTEWeightedPool } from '../../exchanges';
import { getNetworkModel } from '../../Models';
import { DEPOSIT_TOKENS } from '../../config/whitelisted-tokens';

export async function fetchCurrentAccount(
  network: Network,
  account: string,
  provider: providers.Provider
) {
  const isContract = (await provider.getCode(account)) !== '0x';
  const model = getNetworkModel(network);
  const lendingRouters = model.getLendingRouters();
  const depositTokens = model
    .getAllTokens()
    .filter((t) => DEPOSIT_TOKENS[network].includes(t.symbol));

  // TODO: get this from the vault views
  const vaultAddresses: string[] = [];
  const { results: positions } = await getAccountPositions(
    network,
    account,
    vaultAddresses,
    provider
  );

  const allCalls = getDepositTokenBalanceCalls(account, depositTokens, provider)
    .concat(
      getAllowanceCalls(
        account,
        lendingRouters.map((l) => l.id),
        depositTokens,
        provider
      )
    )
    .concat(getVaultBalanceCalls(network, account, positions, provider))
    .concat(getStakedNOTECalls(network, account, provider))
    .concat(
      getLendingRouterApprovalCalls(network, account, lendingRouters, provider)
    );
  // TODO: get reward claims, get withdraw requests.

  return fetchUsingMulticall<AccountDefinition>(
    network,
    allCalls,
    [
      (results: Record<string, unknown>) => {
        return {
          [account]: {
            address: account,
            network,
            isContract,
            balances: Object.keys(results)
              .filter((k) => k.includes('balance'))
              .map((k) => results[k] as TokenBalance),
            vaultLastUpdateTime: Object.keys(results).reduce((agg, k) => {
              if (k.includes('lastEntryTime')) {
                agg.set(k, results[k] as number);
              }
              return agg;
            }, new Map() as Map<string, number>),
            allowances: Object.keys(results)
              .filter((k) => k.includes('.allowance'))
              .map((k) => {
                const [_, lendingRouter] = k.split('.');
                return {
                  spender: lendingRouter,
                  amount: results[k] as TokenBalance,
                };
              }),
            stakeNOTEStatus: results['stakeNOTEStatus'] as StakeNoteStatus,
            rewardClaims: Object.keys(results)
              .filter((k) => k.includes('.rewardClaim'))
              .reduce((agg, k) => {
                return Object.assign(agg, {
                  [k.split('.')[0]]: results[k],
                });
              }, {} as Record<string, TokenBalance[]>),
            lendingRouterApprovals: Object.keys(results)
              .filter((k) => k.includes('.lendingRouterApproval'))
              .reduce((agg, k) => {
                const [lendingRouter, _] = k.split('.');
                return Object.assign(agg, {
                  [lendingRouter]: results[k] as boolean,
                });
              }, {} as Record<string, boolean>),
          },
        };
      },
    ],
    provider
  );
}

function getDepositTokenBalanceCalls(
  account: string,
  depositTokens: TokenDefinition[],
  provider: providers.Provider
): AggregateCall[] {
  return depositTokens.map((token) => {
    if (token.address === ZERO_ADDRESS) {
      return {
        stage: 0,
        target: getMulticall(provider),
        method: 'getEthBalance',
        args: [account],
        key: `${token.address}.balance`,
      };
    } else {
      return {
        stage: 0,
        target: new Contract(token.address, ERC20ABI, provider),
        method: 'balanceOf',
        args: [account],
        key: `${token.address}.balance`,
        transform: (b: BigNumber) => {
          return TokenBalance.from(b, token);
        },
      };
    }
  });
}

function getAllowanceCalls(
  account: string,
  lendingRouters: string[],
  depositTokens: TokenDefinition[],
  provider: providers.Provider
): AggregateCall[] {
  return depositTokens.flatMap((token) =>
    lendingRouters.map((l) => {
      if (token.address === ZERO_ADDRESS) {
        // ETH allowance is always max, although we will probably just use
        // WETH allowance for the lending router
        return {
          stage: 0,
          target: NO_OP,
          method: NO_OP,
          key: `${token.address}.${l}.allowance`,
          transform: () => {
            return TokenBalance.from(MAX_APPROVAL, token);
          },
        };
      } else {
        return {
          stage: 0,
          target: new Contract(token.address, ERC20ABI, provider),
          method: 'allowance',
          args: [account, l],
          key: `${token.address}.${l}.allowance`,
          transform: (b: BigNumber) => {
            return TokenBalance.from(b, token);
          },
        };
      }
    })
  );
}

async function getAccountPositions(
  network: Network,
  account: string,
  vaultAddresses: string[],
  provider: providers.Provider
) {
  const registry = new Contract(
    ADDRESS_REGISTRY[network],
    AddressRegistryABI,
    provider
  );
  const calls = vaultAddresses.map((v) => {
    return {
      stage: 0,
      target: registry,
      method: 'getVaultPosition',
      args: [account, v],
      key: v,
      transform: (r: [string, number]) => {
        const [lendingRouter, lastEntryTime] = r;
        return {
          lendingRouter,
          lastEntryTime,
        };
      },
    };
  });
  return aggregate<{
    lendingRouter: string;
    lastEntryTime: number;
  }>(calls, provider);
}

function getVaultBalanceCalls(
  network: Network,
  account: string,
  positions: Record<
    string,
    {
      lendingRouter: string;
      lastEntryTime: number;
    }
  >,
  provider: providers.Provider
): AggregateCall[] {
  const model = getNetworkModel(network);

  return Object.entries(positions)
    .filter(([_, { lendingRouter }]) => lendingRouter !== ZERO_ADDRESS)
    .flatMap(([v, { lendingRouter, lastEntryTime }]) => {
      const l = new Contract(lendingRouter, LendingRouterABI, provider);
      return [
        {
          stage: 0,
          target: NO_OP,
          method: NO_OP,
          key: `${v}.lastEntryTime`,
          transform: () => lastEntryTime,
        },
        {
          stage: 0,
          target: l,
          method: 'balanceOfCollateral',
          args: [account, v],
          key: `${v}.vaultShares`,
          transform: (b: BigNumber) => {
            return TokenBalance.from(b, model.getVaultShare(v));
          },
        },
        {
          stage: 0,
          target: l,
          method: 'balanceOfBorrowShares',
          args: [account, v],
          key: `${v}.vaultDebt`,
          transform: (b: BigNumber) => {
            return TokenBalance.from(b, model.getVaultDebt(v, lendingRouter));
          },
        },
      ];
    });
}

function getStakedNOTECalls(
  network: Network,
  account: string,
  provider: providers.Provider
): AggregateCall[] {
  if (network !== Network.mainnet) return [];
  return [
    {
      stage: 0,
      target: SNOTEWeightedPool.sNOTE_Contract.connect(provider),
      method: 'accountRedeemWindowBegin',
      args: [account],
      key: `stakeNOTEStatus`,
      transform: (r: BigNumber) => {
        const redeemWindowBegin = r.toNumber();
        const redeemWindowEnd =
          redeemWindowBegin + SNOTEWeightedPool.redeemWindowSeconds;
        const inCoolDown = getNowSeconds() < redeemWindowBegin;
        const inRedeemWindow =
          redeemWindowBegin <= getNowSeconds() &&
          getNowSeconds() < redeemWindowEnd;

        return {
          redeemWindowBegin,
          redeemWindowEnd,
          inCoolDown,
          inRedeemWindow,
        };
      },
    },
  ];
}

function getLendingRouterApprovalCalls(
  network: Network,
  account: string,
  lendingRouters: ReturnType<
    ReturnType<typeof getNetworkModel>['getLendingRouters']
  >,
  provider: providers.Provider
): AggregateCall[] {
  return lendingRouters
    .filter((l) => l.name === 'Morpho')
    .map((l) => {
      return {
        stage: 0,
        target: new Contract(MorphoRouter[network], MorphoABI, provider),
        method: 'isAuthorized',
        args: [account, l.id],
        key: `${l.id}.lendingRouterApproval`,
        transform: (b: boolean) => b,
      };
    });
}
