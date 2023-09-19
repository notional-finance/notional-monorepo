require('dotenv').config();

import { BigNumber, ethers, VoidSigner } from 'ethers';
import Notional, { Contracts } from '../../src';
import { AccountGraphLoader } from '../../src/account';
import GraphClient from '../../src/data/GraphClient';
import { decodeBinary, fetchAndEncodeSystem } from '../../src/data/SystemData';
import { getNowSeconds } from '../../src/libs/utils';
import { VaultFactory } from '../../src/vaults';

const mainnetAddresses = require('../../src/config/mainnet.json');

const mainnetGraphEndpoint =
  'https://api.thegraph.com/subgraphs/name/notional-finance/mainnet-v2';

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
    notional = await Notional.load(1, provider);
  });

  it('loads account data', async () => {
    const addr = '0x9a25d79ab755718e0b12bd3c927a010a543c2b31';
    const account = await notional.getAccount(addr);
    await account.accountData?.fetchHistory(addr);
    console.log(account.accountData?.getFullTransactionHistory());
  });

  it('returns batch account queries', async () => {
    const graphClient = new GraphClient(mainnetGraphEndpoint, 0, false);
    const batch = await AccountGraphLoader.loadBatch(graphClient);
    console.log(
      Array.from(batch.values()).filter((a) => a.vaultAccounts.length !== 0)
    );
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

    const initData = decodeBinary(binary, provider);
    console.log(initData);
  });

  it('calculates a liquidation threshold', async () => {
    const graphClient = new GraphClient(mainnetGraphEndpoint, 0, false);
    const { vaultInstance: metaVault } = await VaultFactory.buildVault(
      '0x77721081',
      '0xf049b944ec83abb50020774d48a8cf40790996e6',
      provider
    );
    const accountData = await AccountGraphLoader.load(
      graphClient,
      '0xd74e7325dFab7D7D1ecbf22e6E6874061C50f243'
    );
    const vaultAccount = accountData.vaultAccounts[0];
    // console.log(metaVault.getStrategyTokenValue(vaultAccount).toExactString());
    // console.log(vaultAccount.primaryBorrowfCash.toExactString());
    // console.log(metaVault.getLeverageRatio(vaultAccount));
    console.log(
      metaVault
        .getLiquidationThresholds(vaultAccount, getNowSeconds())[0]
        .ethExchangeRate?.toExactString()
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
