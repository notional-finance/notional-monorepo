import {
  TreasuryManager__factory,
  ERC20__factory,
} from '@notional-finance/contracts';
import { Network, getProviderFromNetwork } from '@notional-finance/util';

export interface Env {
  NETWORK: string;
  TREASURY_MANAGER_ADDRESS: string;
  TX_RELAY_URL: string;
  TX_RELAY_AUTH_TOKEN: string;
}

// TODO: fetch these from DB or blockchain
const vaults = ['0xdb08f663e5D765949054785F2eD1b2aa1e9C22Cf'];
const rewardTokens = ['0x11cdb42b0eb46d95f990bedd4695a6e3fa034978'];

const claimRewards = async (env: Env, provider: any) => {
  return Promise.all(
    vaults.map((v) => {
      const encoded = TreasuryManager__factory.connect(
        v,
        provider
      ).interface.encodeFunctionData('claimVaultRewardTokens', [v]);

      const payload = JSON.stringify({
        to: env.TREASURY_MANAGER_ADDRESS,
        data: encoded,
      });

      return fetch(env.TX_RELAY_URL + '/v1/txes/0', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': env.TX_RELAY_AUTH_TOKEN,
        },
        body: payload,
      });
    })
  );
};

const reinvestVault = async (_: Env, provider: any, vault: string) => {
  const balances = rewardTokens.map((t) =>
    ERC20__factory.connect(t, provider).balanceOf(vault)
  );

  console.log(balances);
};

const reinvestRewards = async (env: Env, provider: any) => {
  return Promise.all(vaults.map((v) => reinvestVault(env, provider, v)));
};

export default {
  async fetch(): Promise<Response> {
    return new Response('OK');
  },
  async scheduled(_: ScheduledController, env: Env): Promise<void> {
    const provider = getProviderFromNetwork(Network[env.NETWORK], true);

    await claimRewards(env, provider);
    await reinvestRewards(env);
  },
};
