import {
  AccountDefinition,
  Registry,
  TokenBalance,
} from '@notional-finance/core-entities';
import { CashFlow, xirr } from './xirr';
import {
  AccountRiskProfile,
  VaultAccountRiskProfile,
} from '@notional-finance/risk-engine';
import {
  Network,
  ONE_MINUTE_MS,
  getNowSeconds,
  groupArrayToMap,
} from '@notional-finance/util';
import { calculateAccruedIncentives } from '@notional-finance/notionable/global/account/incentives';
import initialValue from './initialValue.json';

const contestStart = 1708923600; // Feb 26, Midnight
const contestEnd = 1711350000; // March 25, Midnight
export const currentContestId = 1;

export const excludedAccounts = ['0xd74e7325dfab7d7d1ecbf22e6e6874061c50f243'];

const exchangeRates = {
  ETH: 3070,
  DAI: 1,
  USDC: 1,
  WBTC: 51_300,
  wstETH: 3550,
  FRAX: 1,
  rETH: 3370,
  USDT: 1,
  cbETH: 3250,
  GMX: 51,
  ARB: 1.85,
  UNI: 10.5,
  LDO: 3.3,
  LINK: 18.5,
  NOTE: 0.14,
  RDNT: 0.37,
};

function convertToUSD(b: TokenBalance): number {
  const exRate = exchangeRates[b.symbol];
  if (!exRate) throw Error(`Ex Rate not found: ${b.symbol}`);
  return b.toFloat() * exRate;
}

export function calculateAccountIRR(account: AccountDefinition) {
  const riskProfile = new AccountRiskProfile(account.balances, account.network);
  const USD = Registry.getTokenRegistry().getTokenBySymbol(Network.all, 'USD');
  const portfolioNetWorth = riskProfile.balances.reduce((acc, b) => {
    return acc + convertToUSD(b.toUnderlying());
  }, 0);

  const allVaultRisk = VaultAccountRiskProfile.getAllRiskProfiles(account);
  const { totalIncentives } = calculateAccruedIncentives(account);
  const valueOfUnclaimedIncentives = Object.keys(totalIncentives).reduce(
    (acc, k) => {
      return acc + convertToUSD(totalIncentives[k].current);
    },
    0
  );

  const initialAccountValue = TokenBalance.fromFloat(
    ((initialValue[account.address.toLowerCase()] || 0) as number).toFixed(6),
    USD
  );

  const totalNetWorth = allVaultRisk
    .map(
      (v) =>
        convertToUSD(v.vaultShares.toUnderlying()) +
        convertToUSD(v.vaultCash.toUnderlying()) +
        Math.abs(convertToUSD(v.vaultDebt.toUnderlying())) * -1
    )
    .reduce((p, c) => p + c, portfolioNetWorth + valueOfUnclaimedIncentives);

  const hasLeverage =
    !!account.balances.find(
      (t) => t.tokenType === 'VaultDebt' || t.isNegative()
    ) ||
    // Also checks if the account has used debt during the contest
    !!(account.accountHistory || []).find(
      (a) =>
        contestStart < a.timestamp &&
        a.timestamp < contestEnd &&
        (a.bundleName === 'Vault Entry' ||
          a.bundleName === 'Vault Exit' ||
          a.bundleName === 'Vault Roll' ||
          a.bundleName === 'Borrow fCash' ||
          a.bundleName === 'Repay fCash' ||
          a.bundleName === 'Borrow Prime Cash' ||
          a.bundleName === 'Repay Prime Cash')
    );

  const cashFlows: CashFlow[] = (account.accountHistory || [])
    .filter((a) => contestStart < a.timestamp && a.timestamp < contestEnd)
    .sort((a, b) => a.timestamp - b.timestamp)
    .filter(
      (h) =>
        h.bundleName === 'Deposit' ||
        h.bundleName === 'Deposit and Transfer' ||
        h.bundleName === 'Withdraw' ||
        h.bundleName === 'Transfer Asset' ||
        h.bundleName === 'Transfer Incentive' ||
        h.bundleName === 'Transfer Secondary Incentive' ||
        h.bundleName === 'Vault Entry' ||
        h.bundleName === 'Vault Exit' ||
        h.bundleName === 'Vault Roll'
    )
    .map((h) => {
      let realized: TokenBalance;
      if (
        (h.bundleName === 'Vault Entry' || h.bundleName === 'Vault Exit') &&
        h.token.tokenType === 'VaultDebt'
      ) {
        // TODO: fix this in the subgraph
        realized = h.underlyingAmountRealized.neg();
      } else if (
        h.bundleName === 'Transfer Incentive' ||
        h.bundleName === 'Transfer Secondary Incentive'
      ) {
        realized = h.tokenAmount;
      } else {
        realized = h.underlyingAmountRealized;
      }

      const balance = convertToUSD(realized);

      return {
        date: new Date(h.timestamp * 1000),
        // This should be a positive cash flow
        amount: balance,
        balance,
        bundleName: h.bundleName,
        hash: h.transactionHash,
      };
    });

  const netDeposits = cashFlows.reduce((s, { balance }) => s + balance, 0) * -1;

  // NOTE: groups up the cash flow to sum up flows that occur at the same time
  const allFlows = Array.from(
    groupArrayToMap(
      [
        {
          date: new Date(contestStart * 1000),
          amount: initialAccountValue.toFloat(),
          balance: initialAccountValue.toFloat(),
        },
      ]
        .concat(cashFlows)
        .concat({
          date: new Date(getNowSeconds() * 1000),
          amount: totalNetWorth,
          balance: totalNetWorth,
        }),
      (t) => t.date.getTime() / 1000
    ).entries()
  )
    .map(([, flow]) => {
      return flow.reduce(
        (f, c, i) => {
          return i > 0
            ? {
                ...f,
                amount: f.amount + c.amount,
                balance: f.balance + c.balance,
              }
            : f;
        },
        {
          date: flow[0].date,
          amount: flow[0].amount,
          balance: flow[0].balance,
        }
      );
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const msSinceFirstDeposit =
    getNowSeconds() * 1000 -
    Math.min(...allFlows.map(({ date }) => date.getTime()));

  let irr: number | null = null;
  // Enforce a $10 minimum deposit, otherwise the IRR will be null
  if (msSinceFirstDeposit > 15 * ONE_MINUTE_MS) {
    try {
      irr = xirr(allFlows);
    } catch (e) {
      console.log(
        `IRR Failed: ${e?.message}`,
        account.address,
        allFlows.map(({ amount, date }) => [amount, date.getTime() / 1000])
      );
    }
  }

  // console.log(
  //   irr,
  //   allFlows.map(({ date, amount }) => `${date.toISOString()},${amount}`)
  //   // .join('\n')
  // );
  // console.log('NET DEPOSITS', irr, netDeposits);

  return {
    irr,
    totalNetWorth,
    netDeposits,
    earnings: totalNetWorth - netDeposits + initialAccountValue.toFloat(),
    hasLeverage,
  };
}
