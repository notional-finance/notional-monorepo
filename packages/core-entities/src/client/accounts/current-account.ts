import {
  AddressRegistryABI,
  ERC20ABI,
  LendingRouterABI,
  MorphoABI,
  WithdrawRequestManagerABI,
  IWithdrawRequestManager,
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
  WithdrawRequest,
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

  const vaultAddresses = model
    .getAllListedVaults(false)
    .map((v) => v.vaultAddress);
  const positions = await getAccountPositions(
    network,
    account,
    vaultAddresses,
    provider
  ).then(({ results }) => {
    // Filter results to only include entries where lendingRouter is not ZERO_ADDRESS
    return Object.fromEntries(
      Object.entries(results).filter(
        ([_, { lendingRouter }]) => lendingRouter !== ZERO_ADDRESS
      )
    );
  });

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
  // TODO: get reward claims

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
                const [vaultAddress, _] = k.split('.');
                agg.set(vaultAddress, results[k] as number);
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
            withdrawRequests: Object.keys(results)
              .filter((k) => k.includes('.withdrawRequest'))
              .sort((a, b) => {
                // If the key includes .canFinalize, it should be last
                if (a.includes('.canFinalize')) return 1;
                if (b.includes('.canFinalize')) return -1;
                if (a.includes('.tokensWithdrawn')) return 1;
                if (b.includes('.tokensWithdrawn')) return -1;
                return 0;
              })
              .reduce((agg, k) => {
                const [vaultAddress, _, index] = k.split('.');
                const wr: WithdrawRequest[] = agg.get(vaultAddress) || [];
                if (k.includes('.canFinalize') && parseInt(index) < wr.length) {
                  wr[parseInt(index)] = {
                    ...wr[parseInt(index)],
                    canFinalize: results[k] as boolean,
                  };
                } else if (
                  k.includes('.tokensWithdrawn') &&
                  results[k] !== undefined &&
                  parseInt(index) < wr.length
                ) {
                  wr[parseInt(index)] = {
                    ...wr[parseInt(index)],
                    withdrawTokenAmount: results[k] as TokenBalance,
                  };
                } else if (results[k]) {
                  wr.push(results[k] as WithdrawRequest);
                }

                agg.set(vaultAddress, wr);
                return agg;
              }, new Map<string, WithdrawRequest[]>()),
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

  return Object.entries(positions).flatMap(
    ([v, { lendingRouter, lastEntryTime }]) => {
      const l = new Contract(lendingRouter, LendingRouterABI, provider);
      const withdrawManagers = model.getWithdrawManagers(v);
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
          key: `${v}.balance.vaultShares`,
          transform: (b: BigNumber) => {
            return TokenBalance.from(b, model.getVaultShare(v));
          },
        },
        {
          stage: 0,
          target: l,
          method: 'balanceOfBorrowShares',
          args: [account, v],
          key: `${v}.balance.vaultDebt`,
          transform: (b: BigNumber) => {
            return TokenBalance.from(
              b,
              model.getVaultDebt(v, lendingRouter)
            ).neg();
          },
        },
        ...withdrawManagers.flatMap((w, index) => {
          return [
            {
              stage: 0,
              target: new Contract(
                w.address,
                WithdrawRequestManagerABI,
                provider
              ),
              method: 'getWithdrawRequest',
              args: [v, account],
              key: `${v}.withdrawRequest.${index}`,
              transform: (
                r: Awaited<
                  ReturnType<IWithdrawRequestManager['getWithdrawRequest']>
                >
              ) => {
                if (r.w.requestId.isZero()) return undefined;

                return {
                  withdrawManager: w.address,
                  requestId: r.w.requestId,
                  finalized: r.s.finalized,
                  sharesAmount: TokenBalance.from(
                    r.w.sharesAmount,
                    model.getVaultShare(v)
                  ),
                  yieldTokenAmount: TokenBalance.from(
                    r.w.yieldTokenAmount,
                    w.yieldToken
                  ),
                  withdrawTokenAmount: r.s.finalized
                    ? TokenBalance.from(
                        r.s.totalWithdraw
                          .mul(r.w.yieldTokenAmount)
                          .div(r.s.totalYieldTokenAmount),
                        w.withdrawToken
                      )
                    : undefined,
                };
              },
            },
            {
              stage: 1,
              target: (prevResults: Record<string, unknown>) => {
                const wr = prevResults[
                  `${v}.withdrawRequest.${index}`
                ] as WithdrawRequest;
                if (!wr || wr.finalized) return NO_OP;
                return new Contract(
                  w.address,
                  WithdrawRequestManagerABI,
                  provider
                );
              },
              method: 'canFinalizeWithdrawRequest',
              args: (prevResults: Record<string, unknown>) => {
                const wr = prevResults[
                  `${v}.withdrawRequest.${index}`
                ] as WithdrawRequest;
                if (!wr || wr.finalized) return [];
                return [wr.requestId];
              },
              key: `${v}.withdrawRequest.${index}.canFinalize`,
              transform: (b: boolean | undefined) => b,
            },
            {
              stage: 2,
              target: (prevResults: Record<string, unknown>) => {
                const wr = prevResults[
                  `${v}.withdrawRequest.${index}`
                ] as WithdrawRequest;
                const canFinalize = prevResults[
                  `${v}.withdrawRequest.${index}.canFinalize`
                ] as boolean;

                if (wr?.finalized === false && canFinalize === true) {
                  return new Contract(
                    w.address,
                    WithdrawRequestManagerABI,
                    provider
                  );
                }
                return NO_OP;
              },
              method: 'finalizeRequestManual',
              args: [v, account],
              key: `${v}.withdrawRequest.${index}.tokensWithdrawn`,
              transform: (b: BigNumber | undefined) =>
                b ? TokenBalance.from(b, w.withdrawToken) : undefined,
            },
          ];
        }),
      ];
    }
  );
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
