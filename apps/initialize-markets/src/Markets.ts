import { Network, batchArray, groupArrayToMap, getSubgraphEndpoint } from '@notional-finance/util';
import { ethers } from 'ethers';

const settleAccountsAddressMap = {
  [Network.mainnet]: "",
  [Network.arbitrum]: "0x22349F0b9b6294dA5526c9E9383164d97c45ACCD"
}

const initializeAllMarketsAddressMap = {
  [Network.mainnet]: "",
  [Network.arbitrum]: "0x9b6C04D1481473B2e52CaEB85822072C35460f27"
}

const INITIALIZE_MARKETS_ABI = [
  "function initializeAllMarkets()",
  "function checkInitializeAllMarkets() view returns (bool canExec, bytes memory execPayload)",
];

const SETTLE_ACCOUNTS_ABI = [
  "function settleAccounts(address[] calldata accounts)",
  "function settleVaultsAccounts((address vaultAddress,address[] accounts)[])",
];

const GRAPH_MAX_LIMIT = 1000;

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

class Markets {
  constructor(private network: Network, private provider: ethers.providers.Provider, private subgraphKey: string) {}

  async checkInitializeAllMarkets() {
    const initializeMarkets = new ethers.Contract(
      initializeAllMarketsAddressMap[this.network],
      INITIALIZE_MARKETS_ABI,
      this.provider,
    )

    const [shouldInitialize] = await initializeMarkets.checkInitializeAllMarkets();

    return shouldInitialize;
  }

  async getInitializeAllMarketsTx() {
    const initializeMarketsInterface = new ethers.utils.Interface(INITIALIZE_MARKETS_ABI);

    return {
      to: initializeAllMarketsAddressMap[this.network],
      data: initializeMarketsInterface.encodeFunctionData("initializeAllMarkets"),
    };
  }

  async getAccountsSettlementTxs(block: number | null = null) {
    const settleAccountsAddress = settleAccountsAddressMap[this.network];

    const settleAccounts = new ethers.utils.Interface(SETTLE_ACCOUNTS_ABI);

    // grab all accounts from graph protocol api, max limit is GRAPH_MAX_LIMIT per request
    const accounts: Array<string> = [];
    let tempAccounts: Array<string> = [];
    let skip = 0;
    do {
      await wait(10);
      tempAccounts = await fetch(getSubgraphEndpoint(this.network, this.subgraphKey), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          query: `{
          accounts(first: ${GRAPH_MAX_LIMIT}, skip: ${skip}, where:{
              nextSettleTime_lte: "${(Date.now() / 1000).toFixed(0)}",
              nextSettleTime_not: 0,
          }${block ? `, block: {number: ${block}}` : ""}) {
            id
          }
      }`,
        }),
      })
        .then((r) => r.json())
        .then((r: { data: { accounts: [{ id: string }] } }) =>
          r.data.accounts.map((a) => a.id)
        );
      accounts.push(...tempAccounts);
      skip += tempAccounts.length;
    } while (tempAccounts.length === GRAPH_MAX_LIMIT);

    console.log("accounts: ", accounts.length);
    const accountsInChunks = batchArray(accounts, 300);

    if (accounts.length) {
      return accountsInChunks.map((accountsChunk) => {
        return {
          to: settleAccountsAddress,
          data: settleAccounts.encodeFunctionData("settleAccounts", [
            accountsChunk,
          ]),
        };
      });
    } else {
      console.log("No accounts to settle");
      return [];
    }
  };

  async getVaultAccountsSettlementTxs(block: number | null = null) {
    const settleAccountsAddress = settleAccountsAddressMap[this.network];

    const settleAccounts = new ethers.utils.Interface(SETTLE_ACCOUNTS_ABI);

    const vaultAccountsArray = await fetch(getSubgraphEndpoint(this.network, this.subgraphKey), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        query: `{
          balances(
            where: {
              account_: {systemAccountType: "None"},
              token_: {tokenType: "VaultDebt", maturity_lt: ${(Date.now() / 1000).toFixed(0)}},
              current_: {currentBalance_gt: 0}
              }
          ${block ? `, block: {number: ${block}}` : ""}) {
            account {
              id
            }
            token {
              vaultAddress
              maturity
            }
          }
        }`
      }),
    })
      .then((r) => r.json())
      .then((r: any) => r.data.balances)
      // group accounts per vault
      .then((r) => groupArrayToMap(r, (v: any) => v.token.vaultAddress))
      // convert to map entries
      .then((r) => Array.from(r.entries()))
      // map to array of { vaultAddress, accounts } objects
      .then(r => r.map(([vault, accounts]) => ({ vaultAddress: vault, accounts: accounts.map(v => v.account.id) })));

    if (vaultAccountsArray.length) {
      return [{
        to: settleAccountsAddress,
        data: settleAccounts.encodeFunctionData(
          "settleVaultsAccounts",
          [vaultAccountsArray]
        ),
      }];
    } else {
      console.log("No vault accounts to settle");
      return [];
    }
  };
}

export default Markets;
