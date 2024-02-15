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
const contestEnd = 1707935655;
export const currentContestId = 1;

export const excludeAccounts = [
  '0x82e8936b187d83fd6eb2b7dab5b19556e9deff1c',
  '0x057868a49c46a3dafc8a30f232f84d29afabc263',
  '0xbf778fc19d0b55575711b6339a3680d07352b221',
  '0xcece1920d4dbb96baf88705ce0a6eb3203ed2eb1',
  '0xbaf40247e54584b109557bcfb71d7f3f2deeb26d',
  '0xbc8744370bcb6d5abf5de8b4086ecfbb4c5629c3',
  '0xc38a332f8f7bc1db0aa697d7fabad643216c0e7f',
  '0xca5ce501eb30711f58eb785412423c542de93f8f',
  '0xcb86c7d82860c276a8a6df73cf8dad5f1fa95db4',
  '0xcc917ab28544c80e2f0e8effbd22551a3cb096be',
  '0xd0891dbc850e1c9f32aa1729d1a2933784aa7db4',
  '0xd08f7241b89f5f07371ae6d9ab41c45aa36d1815',
  '0xd8b3affa8747b9aea0f60ff97d7797942276fcda',
  '0xdecb8e1ba089781583af0884c4d99c24621ed73f',
  '0xe31ac8c8c5b2f51abe13ef3afd3e2a552c1165b2',
  '0xec2ab9d7df156195236af3d78fdc59f87d0dfe25',
  '0xf8a89af2d506842f391327ccef5b29414144a373',
  '0xfffff9b1c2c387b1e3d19af292d91d913374f42b',
  '0xffec59f34e4d37ffad30e0d02f75725085970bfb',
  '0xfe821641646058b410a21790fe8cc14a221f646b',
  '0xf059b59bdbec91d83c558b4a3cd3c1c6e275f2f1',
  '0x222222222222cf64a76ae3d36859958c864fda2c',
  '0x1f32f3c8b28b7b94f0160da9fb7ba86470bd0f07',
  '0x0566d52171036546de97d797da1ee35088ea182e',
];
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
  if (msSinceFirstDeposit > 15 * ONE_MINUTE_MS) {
    try {
      irr = xirr(allFlows);
    } catch (e) {
      console.log(
        'IRR Failed',
        account.address,
        allFlows.map(({ amount, date }) => [
          amount,
          date.getTime() / 1000,
          valueOfUnclaimedIncentives,
          portfolioNetWorth,
        ])
      );
    }
  }

  console.log(
    allFlows
      .map(({ amount, date }) => [amount, date.getTime() / 1000].join(','))
      .join('\n')
  );
  console.log(
    cashFlows
      .map((c) =>
        [c['bundleName'], c.amount.toFixed(6), c.date.toString()].join(',')
      )
      .join('\n')
  );

  return {
    irr,
    totalNetWorth,
    netDeposits,
    earnings: totalNetWorth + netDeposits,
  };
}
