import { ERC20ABI } from '@notional-finance/contracts';
import {
  MAX_APPROVAL,
  Network,
  ZERO_ADDRESS,
  getNowSeconds,
  sNOTE,
} from '@notional-finance/util';
import { BigNumber, Contract, providers } from 'ethers';
import {
  AggregateCall,
  NO_OP,
  getMulticall,
} from '@notional-finance/multicall';
import { TokenBalance } from '../../token-balance';
import {
  AccountDefinition,
  AccountIncentiveDebt,
  StakeNoteStatus,
} from '../../Definitions';
import {
  fetchGraph,
  fetchUsingMulticall,
  loadGraphClientDeferred,
} from '../../server/server-registry';
import { SNOTEWeightedPool } from '../../exchanges';
import { getNetworkModel } from '../../Models';
import { getVaultType } from '../../config/whitelisted-vaults';
import { SingleSidedLP } from '../../vaults';

export async function fetchCurrentAccount(
  network: Network,
  account: string,
  provider: providers.Provider
) {
  const isContract = (await provider.getCode(account)) !== '0x';
  const { AccountPositionsDocument } = await loadGraphClientDeferred();
  const positions = await fetchGraph(
    network,
    AccountPositionsDocument,
    (r) => r.balances,
    subgraphApiKey,
    { account }
  );

  const allCalls = getNotionalAccount(network, account, notional)
    .concat(getWalletCalls(network, account, notional))
    .concat(getVaultCalls(network, account, notional))
    .concat(getStakedNOTECalls(network, account, provider));

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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            allowPrimeBorrow: (results[`${notional.address}.account`] as any)[
              'allowPrimeBorrow'
            ],
            balances: Object.keys(results).flatMap((k) =>
              k.includes('balance') || k.includes('account')
                ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  ((results[k] as any)['balances'] as TokenBalance[])
                : []
            ),
            accountIncentiveDebt: Object.keys(results).flatMap(
              (k) =>
                (k.includes('account')
                  ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (results[k] as any)['accountIncentiveDebt']
                  : []) as AccountIncentiveDebt[]
            ),
            secondaryIncentiveDebt: Object.keys(results).flatMap(
              (k) =>
                (k.includes('secondaryIncentiveDebt')
                  ? results[k]
                  : []) as AccountIncentiveDebt[]
            ),
            vaultLastUpdateTime: Object.keys(results).reduce((agg, k) => {
              try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const vaultLastUpdateTime = (results[k] as any)[
                  'vaultLastUpdateTime'
                ];
                if (vaultLastUpdateTime) {
                  agg.set(vaultLastUpdateTime[0], vaultLastUpdateTime[1]);
                }
              } catch {
                // ignore
              }
              return agg;
            }, new Map() as Map<string, number>),
            allowances: Object.keys(results)
              .filter((k) => k.includes('.allowance'))
              .map((k) => {
                return {
                  spender: notional.address,
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
          },
        };
      },
    ],
    provider
  );
}

function getWalletCalls(
  network: Network,
  account: string,
  notional: NotionalV3
): AggregateCall[] {
  const model = getNetworkModel(network);
  const walletTokensToTrack = model
    .getAllTokens()
    .filter(
      (t) =>
        (t.currencyId !== undefined && t.tokenType === 'Underlying') ||
        t.tokenType === 'NOTE' ||
        t.symbol === 'sNOTE'
    );

  return walletTokensToTrack.flatMap<AggregateCall>((token) => {
    if (token.address === ZERO_ADDRESS) {
      return [
        {
          stage: 0,
          target: getMulticall(notional.provider),
          method: 'getEthBalance',
          args: [account],
          key: `${token.address}.balance`,
          transform: (b: BigNumber) => {
            return { balances: [TokenBalance.from(b, token)] };
          },
        },
        {
          stage: 0,
          target: NO_OP,
          method: NO_OP,
          key: `${token.address}.allowance`,
          transform: () => {
            return TokenBalance.from(MAX_APPROVAL, token);
          },
        },
      ];
    } else {
      const allowanceAddress =
        network === Network.mainnet &&
        (token.symbol === 'WETH' || token.symbol === 'NOTE')
          ? sNOTE
          : notional.address;

      return [
        {
          stage: 0,
          target: new Contract(token.address, ERC20ABI, notional.provider),
          method: 'balanceOf',
          args: [account],
          key: `${token.address}.balance`,
          transform: (b: BigNumber) => {
            return { balances: [TokenBalance.from(b, token)] };
          },
        },
        {
          stage: 0,
          target: new Contract(token.address, ERC20ABI, notional.provider),
          method: 'allowance',
          args: [account, allowanceAddress],
          key: `${token.address}.allowance`,
          transform: (b: BigNumber) => {
            return TokenBalance.from(b, token);
          },
        },
      ];
    }
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

function getVaultCalls(
  network: Network,
  account: string,
  notional: NotionalV3
): AggregateCall[] {
  const model = getNetworkModel(network);

  // NOTE: include disabled vaults as well
  return (model.getAllListedVaults(true, true) || []).flatMap<AggregateCall>(
    (v) => {
      const vaultCalls: AggregateCall[] = [
        {
          stage: 0,
          target: notional,
          method: 'getVaultAccount',
          args: [account, v.vaultAddress],
          key: `${v.vaultAddress}.balance`,
          transform: (
            vaultAccount: Awaited<ReturnType<NotionalV3['getVaultAccount']>>
          ) => {
            const maturity = vaultAccount.maturity.toNumber();
            if (maturity === 0) return { balances: [] };
            const vaultShare = model.getVaultShare(v.vaultAddress, maturity);
            const vaultDebt = model.getVaultDebt(v.vaultAddress, maturity);
            const vaultUnderlying = model.getUnderlying(vaultShare.currencyId);

            const balances = [
              TokenBalance.from(vaultAccount.vaultShares, vaultShare),
              parseVaultDebtBalance(
                vaultDebt,
                vaultUnderlying,
                vaultAccount.accountDebtUnderlying,
                maturity
              ),
            ];

            if (!vaultAccount.tempCashBalance.isZero()) {
              const vaultCash = model.getVaultCash(v.vaultAddress, maturity);
              balances.push(
                TokenBalance.from(vaultAccount.tempCashBalance, vaultCash)
              );
            }

            return {
              balances,
              vaultLastUpdateTime: [
                v.vaultAddress,
                vaultAccount.lastUpdateBlockTime.toNumber(),
              ],
            };
          },
        },
      ];

      const vaultType = getVaultType(v.vaultAddress, network);
      if (vaultType === 'SingleSidedLP_DirectClaim') {
        const adapter = model.getVaultAdapter(v.vaultAddress) as SingleSidedLP;
        const rewardTokens = adapter.rewardTokens;

        vaultCalls.push({
          stage: 0,
          target: new Contract(
            v.vaultAddress,
            ISingleSidedLPStrategyVaultABI,
            notional.provider
          ),
          method: 'getAccountRewardClaim',
          args: [account, getNowSeconds()],
          key: `${v.vaultAddress}.rewardClaim`,
          transform: (r: BigNumber[]) => {
            return r.map(
              (b, i) => new TokenBalance(b, rewardTokens[i], network)
            );
          },
        });
      }

      return vaultCalls;
    }
  );
}
