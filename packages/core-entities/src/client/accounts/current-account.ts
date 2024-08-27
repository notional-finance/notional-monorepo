import {
  ERC20ABI,
  ISingleSidedLPStrategyVaultABI,
  NotionalV3,
  NotionalV3ABI,
} from '@notional-finance/contracts';
import {
  MAX_APPROVAL,
  Network,
  NotionalAddress,
  PRIME_CASH_VAULT_MATURITY,
  SCALAR_PRECISION,
  ZERO_ADDRESS,
  encodefCashId,
  getNowSeconds,
  sNOTE,
} from '@notional-finance/util';
import { BigNumber, Contract, providers } from 'ethers';
import { Registry } from '../../Registry';
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
import { fetchUsingMulticall } from '../../server/server-registry';
import { SNOTEWeightedPool } from '../../exchanges';
import { getVaultType } from '../../config/whitelisted-vaults';
import { SingleSidedLP } from '../../vaults';

export function fetchCurrentAccount(
  network: Network,
  account: string,
  provider: providers.Provider
) {
  const notional = new Contract(
    NotionalAddress[network],
    NotionalV3ABI,
    provider
  ) as NotionalV3;

  const allCalls = getNotionalAccount(network, account, notional)
    .concat(getSecondaryIncentiveCalls(network, account))
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
            vaultLastUpdateTime: Object.keys(results).reduce(
              (agg, k) =>
                Object.assign(
                  agg,
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  ((results[k] as any)['vaultLastUpdateTime'] as Record<
                    string,
                    number
                  >) || {}
                ),
              {} as Record<string, number>
            ),
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

function getNotionalAccount(
  network: Network,
  account: string,
  notional: NotionalV3
): AggregateCall[] {
  const tokens = Registry.getTokenRegistry();
  const NOTE = Registry.getTokenRegistry().getTokenBySymbol(network, 'NOTE');

  return [
    {
      target: notional,
      method: 'getAccount',
      args: [account],
      key: `${notional.address}.account`,
      transform: (r: Awaited<ReturnType<NotionalV3['getAccount']>>) => {
        const accountIncentiveDebt: AccountIncentiveDebt[] = [];

        const accountBalances = r.accountBalances.flatMap((b) => {
          const balances: TokenBalance[] = [];

          if (b.cashBalance.gt(0)) {
            const pCash = tokens.getPrimeCash(network, b.currencyId);
            balances.push(TokenBalance.from(b.cashBalance, pCash));
          } else if (b.cashBalance.lt(0)) {
            const pCash = tokens.getPrimeCash(network, b.currencyId);
            const pDebt = tokens.getPrimeDebt(network, b.currencyId);
            balances.push(
              TokenBalance.from(b.cashBalance, pCash).toToken(pDebt)
            );
          }

          if (b.nTokenBalance.gt(0)) {
            const nToken = tokens.getNToken(network, b.currencyId);
            balances.push(TokenBalance.from(b.nTokenBalance, nToken));
          }

          if (b.currencyId > 0) {
            accountIncentiveDebt.push({
              value: TokenBalance.from(b.accountIncentiveDebt, NOTE),
              currencyId: b.currencyId,
            });
          }

          return balances;
        });

        const portfolioBalances = r.portfolio.map((a) => {
          const fCashId = encodefCashId(a.currencyId, a.maturity.toNumber());
          return TokenBalance.fromID(a.notional, fCashId, network);
        });

        return {
          balances: accountBalances.concat(portfolioBalances),
          accountIncentiveDebt,
          allowPrimeBorrow: r.accountContext.allowPrimeBorrow,
        };
      },
    },
  ];
}

function getWalletCalls(
  network: Network,
  account: string,
  notional: NotionalV3
): AggregateCall[] {
  const tokens = Registry.getTokenRegistry();
  const walletTokensToTrack = tokens
    .getAllTokens(network)
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

function getSecondaryIncentiveCalls(
  network: Network,
  account: string
): AggregateCall[] {
  const tokens = Registry.getTokenRegistry();
  const config = Registry.getConfigurationRegistry();

  return tokens
    .getAllTokens(network)
    .filter(
      (t) =>
        t.currencyId !== undefined &&
        t.tokenType === 'nToken' &&
        config.getSecondaryRewarder(t)
    )
    .flatMap((t) => {
      const rewarder = config.getSecondaryRewarder(t);
      const secondary = config.getAnnualizedSecondaryIncentives(t);
      if (!rewarder || !secondary) return [];
      const { rewardToken } = secondary;
      const rewardPrecision = BigNumber.from(10).pow(rewardToken.decimals);
      return [
        {
          stage: 0,
          target: rewarder,
          method: 'rewardDebtPerAccount',
          args: [account],
          key: `${t.currencyId}.secondaryIncentiveDebt`,
          transform: (r: BigNumber) => ({
            // Secondary rewarder always returns this in 18 decimals
            value: TokenBalance.from(r, rewardToken).scale(
              rewardPrecision,
              SCALAR_PRECISION
            ),
            currencyId: t.currencyId,
          }),
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

function getVaultCalls(
  network: Network,
  account: string,
  notional: NotionalV3
): AggregateCall[] {
  const config = Registry.getConfigurationRegistry();
  return (
    config.getAllListedVaults(network, true) || []
  ).flatMap<AggregateCall>((v) => {
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
          const { vaultShareID, primaryDebtID, primaryCashID, primaryTokenId } =
            config.getVaultIDs(network, v.vaultAddress, maturity);
          const balances = [
            TokenBalance.fromID(
              vaultAccount.vaultShares,
              vaultShareID,
              network
            ),
            parseVaultDebtBalance(
              primaryDebtID,
              primaryTokenId,
              vaultAccount.accountDebtUnderlying,
              maturity,
              network
            ),
          ];

          if (!vaultAccount.tempCashBalance.isZero()) {
            balances.push(
              TokenBalance.fromID(
                vaultAccount.tempCashBalance,
                primaryCashID,
                network
              )
            );
          }

          return {
            balances,
            vaultLastUpdateTime: {
              [v.vaultAddress]: vaultAccount.lastUpdateBlockTime.toNumber(),
            },
          };
        },
      },
    ];

    const vaultType = getVaultType(v.vaultAddress, network);
    if (vaultType === 'SingleSidedLP_DirectClaim') {
      const adapter = Registry.getVaultRegistry().getVaultAdapter(
        network,
        v.vaultAddress
      ) as SingleSidedLP;
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
          return r.map((b, i) =>
            TokenBalance.fromID(b, rewardTokens[i], network)
          );
        },
      });
    }

    return vaultCalls;
  });
}

function parseVaultDebtBalance(
  debtID: string,
  underlyingID: string,
  balance: BigNumber,
  maturity: number,
  network: Network
) {
  if (maturity === PRIME_CASH_VAULT_MATURITY) {
    // In in the prime vault maturity, convert from underlying back to prime debt denomination
    const tokens = Registry.getTokenRegistry();
    const vaultDebtToken = tokens.getTokenByID(network, debtID);
    const pDebt = TokenBalance.fromID(balance, underlyingID, network)
      .scaleFromInternal()
      .toToken(tokens.unwrapVaultToken(vaultDebtToken));
    return TokenBalance.fromID(pDebt.n, debtID, network);
  }

  return TokenBalance.fromID(balance, debtID, network);
}

// NOTE: this is not used anywhere yet but will be activated when we add support for secondary debt
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getVaultSecondaryDebtCalls(
  notional: Contract,
  account: string,
  vaultAddress: string,
  network: Network
) {
  const config = Registry.getConfigurationRegistry();
  return [
    {
      stage: 0,
      target: notional,
      method: 'getVaultAccountSecondaryDebt',
      args: [account, vaultAddress],
      key: `${vaultAddress}.balance2`,
      transform: (
        r: Awaited<ReturnType<NotionalV3['getVaultAccountSecondaryDebt']>>
      ) => {
        const maturity = r.maturity.toNumber();
        if (maturity === 0) return { balances: [] };
        const {
          secondaryOneCashID,
          secondaryOneDebtID,
          secondaryOneTokenId,
          secondaryTwoCashID,
          secondaryTwoDebtID,
          secondaryTwoTokenId,
        } = config.getVaultIDs(network, vaultAddress, maturity);

        const secondaries: TokenBalance[] = [];

        if (
          secondaryOneDebtID &&
          secondaryOneTokenId &&
          !r.accountSecondaryDebt[0].isZero()
        ) {
          secondaries.push(
            parseVaultDebtBalance(
              secondaryOneDebtID,
              secondaryOneTokenId,
              r.accountSecondaryDebt[0],
              maturity,
              network
            )
          );
        }

        if (
          secondaryTwoDebtID &&
          secondaryTwoTokenId &&
          !r.accountSecondaryDebt[1].isZero()
        ) {
          secondaries.push(
            parseVaultDebtBalance(
              secondaryTwoDebtID,
              secondaryTwoTokenId,
              r.accountSecondaryDebt[1],
              maturity,
              network
            )
          );
        }

        if (secondaryOneCashID && !r.accountSecondaryCashHeld[0].isZero()) {
          secondaries.push(
            TokenBalance.fromID(
              r.accountSecondaryCashHeld[0],
              secondaryOneCashID,
              network
            )
          );
        }

        if (secondaryTwoCashID && !r.accountSecondaryCashHeld[1].isZero()) {
          secondaries.push(
            TokenBalance.fromID(
              r.accountSecondaryCashHeld[1],
              secondaryTwoCashID,
              network
            )
          );
        }

        return { balances: secondaries };
      },
    },
  ];
}
