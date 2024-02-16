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

const contestStart = 1704096000;
const contestEnd = 1711350000; // March 25, Midnight
export const currentContestId = 1;

const exchangeRates = {
  ETH: 2500,
  DAI: 1,
  USDC: 1,
  WBTC: 50_000,
  wstETH: 2_700,
  FRAX: 1,
  rETH: 2_600,
  USDT: 1,
  cbETH: 2_600,
  GMX: 42,
  ARB: 2,
  UNI: 7,
  LDO: 3,
  LINK: 20,
  NOTE: 0.1,
  RDNT: 0.3,
};

function convertToUSD(b: TokenBalance): number {
  const exRate = exchangeRates[b.symbol];
  if (!exRate) throw Error(`Ex Rate not found: ${b.symbol}`);
  return b.toFloat() * exRate;
}

export function calculateAccountIRR(account: AccountDefinition) {
  const riskProfile = new AccountRiskProfile(account.balances, account.network);
  const USD = Registry.getTokenRegistry().getTokenBySymbol(Network.All, 'USD');
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
        convertToUSD(v.vaultCash.toUnderlying()) -
        convertToUSD(v.vaultDebt.toUnderlying())
    )
    .reduce((p, c) => p + c, portfolioNetWorth + valueOfUnclaimedIncentives);

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

  const netDeposits =
    cashFlows.reduce((s, { balance }) => s + balance, 0) * -1 +
    initialAccountValue.toFloat();

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

  let irr = 0;
  if (msSinceFirstDeposit > 15 * ONE_MINUTE_MS && Math.abs(netDeposits) < 10) {
    try {
      irr = xirr(allFlows);
    } catch (e) {
      console.log(
        'IRR Failed',
        account.address,
        allFlows.map(({ amount, date }) => [amount, date.getTime() / 1000])
      );
    }
  }

  return {
    irr,
    totalNetWorth,
    netDeposits,
    earnings: totalNetWorth + netDeposits,
  };
}
