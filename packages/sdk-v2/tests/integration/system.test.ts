import { BigNumber, ethers, VoidSigner } from 'ethers';
import Notional, { Contracts } from '../../src';
import GraphClient from '../../src/data/GraphClient';
import { decodeBinary, fetchAndEncodeSystem } from '../../src/data/SystemData';
import { System } from '../../src/system';
import { VaultFactory } from '../../src/vaults';

require('dotenv').config();

const mainnetAddresses = require('../../src/config/goerli.json');

const mainnetGraphEndpoint =
  'https://api.thegraph.com/subgraphs/name/notional-finance/goerli-v2';

describe('System Integration Test', () => {
  let provider: ethers.providers.JsonRpcBatchProvider;
  let contracts: Contracts;
  let notional: Notional;

  beforeEach(async () => {
    provider = new ethers.providers.JsonRpcBatchProvider(
      `https://eth-goerli.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`
    );
    const signer = new VoidSigner(ethers.constants.AddressZero, provider);
    contracts = Notional.getContracts(mainnetAddresses, signer);
    notional = await Notional.load(5, provider);
  });

  it('loads account data', async () => {
    const addr = '0x4ba1d028e053A53842Ce31b0357C5864B40Ef909';
    const account = await notional.getAccount(addr);
    await account.accountData?.fetchHistory(addr);
    // console.log(account);
    // console.log(account.accountData?.accountHistory);
    account.accountData?.getFullTransactionHistory();
  });

  it.only('returns system configuration from the graph', async () => {
    const graphClient = new GraphClient(mainnetGraphEndpoint, 0, false);
    const { binary } = await fetchAndEncodeSystem(
      graphClient,
      provider,
      contracts,
      false,
      process.env.EXCHANGE_RATE_API || '',
      { USD: BigNumber.from(1) }
    );

    const initData = decodeBinary(binary, provider);
    // console.log(json);

    const system = new System(
      '',
      {} as GraphClient,
      {} as Contracts,
      provider,
      0,
      'goerli',
      false,
      initData
    );
    console.log(system.lastUpdateTimestamp);
    const metaVault = VaultFactory.buildVaultFromCache(
      '0x77721081',
      '0xe767769b639af18dbedc5fb534e263ff7be43456'
    );

    console.log(
      metaVault.initParams.strategyContext.totalStrategyTokensGlobal.n.toString()
    );
  });

  it('initializes the meta stable vault', async () => {
    const { initParams } = await VaultFactory.buildVault(
      '0x77721081',
      '0xe767769b639af18dbedc5fb534e263ff7be43456',
      provider
    );
    console.log(initParams);
  });
});
