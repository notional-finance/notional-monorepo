import { BigNumber, ethers, VoidSigner } from 'ethers';
import Notional, { Contracts } from '../../src';
import GraphClient from '../../src/data/GraphClient';
import { decodeBinary, fetchAndEncodeSystem } from '../../src/data/SystemData';
import { config } from 'dotenv'

config();

import mainnetAddresses from '../../src/config/mainnet.json';

const mainnetGraphEndpoint = 'https://api.thegraph.com/subgraphs/name/notional-finance/mainnet-debug';

describe('System Integration Test', () => {
  let provider: ethers.providers.JsonRpcBatchProvider;
  let contracts: Contracts;
  let notional: Notional;

  beforeEach(async () => {
    provider = new ethers.providers.JsonRpcBatchProvider(
      `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`
    );
    const signer = new VoidSigner(ethers.constants.AddressZero, provider);
    contracts = Notional.getContracts(mainnetAddresses, signer);
  });

  it('loads account data', async () => {
    const addr = '0xF1C2dD9bD863f2444086B739383F1043E6b88F69';
    const account = await notional.getAccount(addr);
    await account.accountData?.fetchHistory(addr);
    console.log(account);
    console.log(account.accountData?.accountHistory);
  });

  it.only('returns system configuration from the graph', async () => {
    const graphClient = new GraphClient(mainnetGraphEndpoint, 0, false);
    const { binary, json } = await fetchAndEncodeSystem(
      graphClient,
      provider,
      contracts,
      false,
      process.env.EXCHANGE_RATE_API || '',
      { USD: BigNumber.from(1) }
    );

    decodeBinary(binary, provider);
    console.log(json);
  });
});
