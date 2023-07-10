import { Network, getProviderFromNetwork } from '@notional-finance/util';
import { BigNumber } from 'ethers';
import { initEventLogger, initMetricLogger } from '@notional-finance/logging';
import * as tokens from './config/tokens.json';
import VaultV3Liquidator from './VaultV3Liquidator';

export interface Env {
  NETWORK: string;
  FLASH_LIQUIDATOR_CONTRACT: string;
  FLASH_LIQUIDATOR_OWNER: string;
  FLASH_LENDER_ADDRESS: string;
  FLASH_LOAN_BUFFER: string;
  NOTIONAL_PROXY_CONTRACT: string;
  DUST_THRESHOLD: string;
  ALCHEMY_KEY: string;
  BN_API_KEY: string;
  DD_API_KEY: string;
  DD_APP_KEY: string;
  TX_RELAY_URL: string;
  TX_RELAY_AUTH_TOKEN: string;
  EXACT_IN_SLIPPAGE_LIMIT: string;
  EXACT_OUT_SLIPPAGE_LIMIT: string;
  GAS_COST_BUFFER: string;
  PROFIT_THRESHOLD: string;
  ZERO_EX_SWAP_URL: string;
  ZERO_EX_API_KEY: string;
}

const accounts = [
  {
    id: '0x019be259bc299f3f653688c7655c87f998bc7bc1',
  },
  {
    id: '0x0ace2dc3995acd739ae5e0599e71a5524b93b886',
  },
  {
    id: '0x1fd865a55eaf5333e6374fb3ad66d22e9885d3aa',
  },
  {
    id: '0x4068a40e229c9e8df8deaf716266ef008d673efe',
  },
  {
    id: '0x41be0117864dc317d1cc8100b01c8ac90da3ba90',
  },
  {
    id: '0x452f5c6238c05e980a235f63dbc11bfbe004cc56',
  },
  {
    id: '0x4e8014ff5bace498dab1a9e2b5c3f4240bc059b6',
  },
  {
    id: '0x6ebce2453398af200c688c7c4ebd479171231818',
  },
  {
    id: '0x6f28cafe12bd97e474a52bcbfea6f2c18ae0f53d',
  },
  {
    id: '0x70c9ea3aa116665010d2c5fb16808dd82fe58ff0',
  },
  {
    id: '0xabc07bf91469c5450d6941dd0770e6e6761b90d6',
  },
  {
    id: '0xb9bfbb35c2ed588a42f9fd1120929c607b463192',
  },
  {
    id: '0xbc323e3564fb498e55cdc83a3ea6bb1af8402d6b',
  },
  {
    id: '0xc12d27954d9122d971c67ef188736f36629ff958',
  },
  {
    id: '0xc3882b132011ff3cea4da81f3303138368dd5d75',
  },
  {
    id: '0xd74e7325dfab7d7d1ecbf22e6e6874061c50f243',
  },
  {
    id: '0xCece1920D4dBb96BAf88705ce0A6Eb3203ed2eB1',
  },
];

const vaults = [
  '0xdb08f663e5D765949054785F2eD1b2aa1e9C22Cf',
  '0xaE38F4B960f44d86e798f36a374a1Ac3f2D859fa',
];

const run = async (env: Env) => {
  initMetricLogger({
    apiKey: env.DD_API_KEY,
  });
  initEventLogger({
    apiKey: env.DD_API_KEY,
  });

  const addrs = accounts.map((a) => a.id);

  const provider = getProviderFromNetwork(Network[env.NETWORK], true);
  const liq = new VaultV3Liquidator(provider, {
    network: env.NETWORK,
    vaultAddrs: vaults,
    flashLiquidatorAddress: env.FLASH_LIQUIDATOR_CONTRACT,
    flashLiquidatorOwner: env.FLASH_LIQUIDATOR_OWNER,
    flashLenderAddress: env.FLASH_LENDER_ADDRESS,
    flashLoanBuffer: BigNumber.from(env.FLASH_LOAN_BUFFER),
    notionalAddress: env.NOTIONAL_PROXY_CONTRACT,
    dustThreshold: BigNumber.from(env.DUST_THRESHOLD),
    txRelayUrl: env.TX_RELAY_URL,
    txRelayAuthToken: env.TX_RELAY_AUTH_TOKEN,
    tokens: new Map<string, string>(Object.entries(tokens.arbitrum)),
    gasCostBuffer: BigNumber.from(env.GAS_COST_BUFFER),
    profitThreshold: BigNumber.from(env.PROFIT_THRESHOLD),
    zeroExUrl: env.ZERO_EX_SWAP_URL,
    zeroExApiKey: env.ZERO_EX_API_KEY,
  });

  const riskyAccounts = await liq.getRiskyAccounts(addrs);

  if (riskyAccounts.length > 0) {
    const riskyAccount = riskyAccounts[0];

    const accountLiq = await liq.getAccountLiquidation(riskyAccount);

    if (accountLiq) {
      await liq.liquidateAccount(accountLiq);
    }
  }
};

export default {
  async fetch(
    request: Request,
    env: Env,
    _: ExecutionContext
  ): Promise<Response> {
    try {
      await run(env);
    } catch (e) {
      console.error(e);
      console.trace();
    }

    const response = new Response('OK', { status: 200 });
    return response;
  },
  async scheduled(): Promise<void> {
    console.log(`Hello World!`);
  },
};
