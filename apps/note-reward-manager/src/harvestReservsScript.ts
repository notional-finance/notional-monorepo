import { ethers } from 'ethers';
import {
  sendTxThroughRelayer,
  get0xData,
  Network,
} from '@notional-finance/util';
import {
  ERC20__factory,
  TreasuryManager__factory,
  Notional__factory,
} from '@notional-finance/contracts';
import { TradeStruct as Trade } from '@notional-finance/contracts/types/TradingModule';
import { TradeType, DexId } from './types';

const env = {
  NETWORK: Network.arbitrum,
  ZERO_EX_API_KEY: process.env.ZERO_EX_API_KEY,
  TX_RELAY_AUTH_TOKEN: process.env.TX_RELAY_AUTH_TOKEN,
};

const WETH = '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1';
// const owner = '0xbf778Fc19d0B55575711B6339A3680d07352B221';
const treasuryMangerAddress = '0x53144559c0d4a3304e2dd9dafbd685247429216d';
const managerBotAddresses = '0x745915418D8B70f39ce9e61A965cBB0C87f9f7Ed';
const notionalAddress = '0x1344A36A1B56144C3Bc62E7757377D288fDE0369';
// const currencyIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
const currencyIds = [1, 3, 4];

const ABI = ['function harvestAssetsFromNotional(uint16[])'];
const treasuryMangerInterface = new ethers.utils.Interface(ABI);

const TWO_HOURS_SEC = 1200;
const nowInSec = () => Math.floor(Date.now() / 1000);

// const provider = new ethers.providers.JsonRpcProvider(
//   `https://virtual.arbitrum.rpc.tenderly.co/834974b1-ccfa-4b7a-a688-557cf4b56a6a`
// );
const provider = new ethers.providers.JsonRpcProvider(
  `https://arb-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`
);

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function harvestEverything() {
  console.log('harvesting');
  const treasuryManger = TreasuryManager__factory.connect(
    treasuryMangerAddress,
    provider
  );

  const data = treasuryMangerInterface.encodeFunctionData(
    'harvestAssetsFromNotional',
    [currencyIds]
  );

  await treasuryManger.callStatic.harvestAssetsFromNotional(currencyIds, {
    from: managerBotAddresses,
    // gasLimit: 60e6,
  });
  // await provider.send('eth_sendTransaction', [
  //   {
  //     from: managerBotAddresses,
  //     to: treasuryMangerAddress,
  //     data,
  //   },
  // ]);

  await sendTxThroughRelayer({
    to: treasuryMangerAddress,
    data,
    env,
  });
  await wait(5000);
}

async function sellEverythingToWETH() {
  console.log('selling everything for WETH');
  const notional = Notional__factory.connect(notionalAddress, provider);
  const treasuryManger = TreasuryManager__factory.connect(
    treasuryMangerAddress,
    provider
  );

  for (const currencyId of currencyIds) {
    const {
      underlyingToken: { tokenAddress: sellToken },
    } = await notional.getCurrency(currencyId);
    if (sellToken === '0x0000000000000000000000000000000000000000') {
      continue;
    }
    const token = ERC20__factory.connect(sellToken, provider);
    const sellAmount = await token.balanceOf(treasuryMangerAddress);
    if (sellAmount.eq(0)) return;
    const zeroXdata = await get0xData({
      sellToken,
      buyToken: WETH,
      sellAmount,
      taker: treasuryMangerAddress,
      env,
    });

    const trade: Trade = {
      tradeType: TradeType.EXACT_IN_SINGLE,
      sellToken,
      buyToken: WETH,
      amount: sellAmount,
      limit: zeroXdata.limit,
      deadline: nowInSec() + TWO_HOURS_SEC,
      exchangeData: zeroXdata.data,
    };

    // check will trade execute successfully
    // await treasuryManger.callStatic.executeTrade(trade, DexId.ZERO_EX, {
    //   from: managerBotAddresses,
    // });

    const data = treasuryManger.interface.encodeFunctionData('executeTrade', [
      trade,
      DexId.ZERO_EX,
    ]);

    await sendTxThroughRelayer({
      to: treasuryMangerAddress,
      data,
      env,
    });
    // await provider.send('eth_sendTransaction', [
    //   {
    //     from: managerBotAddresses,
    //     to: treasuryMangerAddress,
    //     data,
    //   },
    // ]);
    await wait(5000);
  }
}

async function printBalances(label: string) {
  console.log('printing balances');
  const notional = Notional__factory.connect(notionalAddress, provider);

  const report = {};
  report['ETH'] = ethers.utils.formatEther(
    await provider.getBalance(treasuryMangerAddress)
  );
  for (const currencyId of currencyIds) {
    // console.log(`processing currencyId ${currencyId}`);
    let {
      underlyingToken: { tokenAddress: sellToken },
    } = await notional.getCurrency(currencyId);
    if (sellToken === '0x0000000000000000000000000000000000000000') {
      sellToken = WETH;
    }
    const token = ERC20__factory.connect(sellToken, provider);
    const balance = await token.balanceOf(treasuryMangerAddress);
    const symbol = await token.symbol();
    const decimals = await token.decimals();
    report[symbol] = ethers.utils.formatUnits(balance, decimals);
  }
  console.log(label, report);
}

// async function sendWETHToOwner() {
//   const treasuryManger = TreasuryManager__factory.connect(treasuryMangerAddress, provider);
//   const weth = ERC20__factory.connect(WETH, provider);
//   const balance = await weth.balanceOf(treasuryMangerAddress);
//   const data = treasuryManger.interface.encodeFunctionData(
//     'withdraw',
//     [WETH, balance.toString()]
//   );
//
//   console.log(`balance of manager ${await weth.balanceOf(treasuryMangerAddress).then(r => r.toString())}`)
//   console.log(`balance of owner ${await weth.balanceOf(owner).then(r => r.toString())}`)
//   await provider.send('eth_sendTransaction', [{
//     from: managerBotAddresses,
//     to: treasuryMangerAddress,
//     data,
//   }]);
//   console.log(`balance of manager ${await weth.balanceOf(treasuryMangerAddress).then(r => r.toString())}`)
//   console.log(`balance of owner ${await weth.balanceOf(owner).then(r => r.toString())}`)
// }

printBalances('initial')
  .then(() => harvestEverything())
  .then(() => printBalances('after harvest'))
  .then(() => sellEverythingToWETH())
  .then(() => printBalances('final'))
  // .then(() => sendWETHToOwner())
  .catch(console.log);
