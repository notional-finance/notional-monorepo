import { Network, getProviderFromNetwork, } from '@notional-finance/util';
import { BigNumber, utils } from "ethers";
import TreasuryManager from "./treasury_manager";
import VaultManager from "./vault_manager";
import Config from "./config";
import DDClient from "./dd_client";
import GasOracle from "./gas_oracle";
import Notifier from "./notifier";
import { Env } from "./types";

export async function handler(env: Env) {
  const {
    DD_API_KEY,
    DD_APP_KEY,
    BN_API_KEY,
    MANAGERS: managers,
    NETWORK: network
  } = env;
  const provider = getProviderFromNetwork(network as Network, true);

  const ddClient = new DDClient(DD_API_KEY, DD_APP_KEY);
  const gasOracle = new GasOracle(network, BN_API_KEY, provider);

  const gasPrice = await gasOracle.getGasPrice();
  if (!gasPrice) {
    throw Error("Failed to get gas price");
  }

  const maxGasPrice = BigNumber.from(Config.MAX_GAS_PRICE);
  const logMsg = `
  gasPrice=${utils.formatUnits(gasPrice, 9)} gwei,
  threshold=${utils.formatUnits(maxGasPrice, 9)} gwei
  `;
  console.log(logMsg);

  if (gasPrice.gt(maxGasPrice)) {
    const notifier = new Notifier(network, ddClient);
    notifier.notifyMessage({
      key: null,
      type: "error",
      text: logMsg,
      title: "Gas too high",
      tags: [`network:${network}`, `event:claim_rewards`],
    });

    await notifier.flush();
    throw Error("Gas too high");
  }

  const managerMap = {
    treasury: new TreasuryManager(network, provider, env),
    vault: new VaultManager(network, provider, ddClient, env)
  }

  for (const managerName of managers.split(",")) {
    const manager = managerMap[managerName];
    if (manager) {
      console.log(`calling ${managerName} manager`);

      try {
        await manager.run();
        console.log('manager run completed');
      } catch (e: any) {
        console.error(`Failed to run manager: ${managerName}`);
        console.error(e);
      }
    }
  }
}

export default {
  async fetch(_request: Request, env: Env, _: ExecutionContext): Promise<Response> {
    await handler(env).catch((error: Error) => {
      console.error(error);
      throw error;
    });

    return new Response('OK');
  },
  // this method can be only call by cloudflare internal system so it does not
  // require any authentication
  async scheduled(_: ScheduledController, env: Env): Promise<void> {
    await handler(env);
  },
};
