import { expect } from 'chai';
import {
  BigNumber,
  Contract,
  // utils,
  // Wallet,
} from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ethers } from 'hardhat';
import { getAccount, setChainState } from './utils';
import { System } from '../../src/system';
import MockSystem from '../mocks/MockSystem';
import {
  ERC20,
  BalancerVault,
  BalancerPool,
} from '@notional-finance/contracts';
import { TypedBigNumber } from '../../src';
import { StakedNote } from '../../src/staking';
// import Order from '../../src/staking/Order';
// import {ExchangeV3} from '../../src/typechain/ExchangeV3';
import { RATE_PRECISION } from '../../src/config/constants';

import factoryABI from './balancer/poolFactory.json';
import poolABI from '.././abi/BalancerPool.json';
import BalancerVaultABI from '.././abi/BalancerVault.json';
import ERC20ABI from '.././abi/ERC20.json';
// const ExchangeV3ABI = require('../../src/abi/ExchangeV3.json');

const forkedBlockNumber = 14191580;

describe('staking test', () => {
  const system = new MockSystem();
  let balancerVault: BalancerVault;
  let balancerPool: BalancerPool;
  // let exchangeV3: ExchangeV3;
  let assets: string[];
  let poolId: string;
  let noteWhale: SignerWithAddress;
  let wethWhale: SignerWithAddress;
  // let testWallet: Wallet;
  let weth: ERC20;
  let note: ERC20;
  System.overrideSystem(system);

  beforeEach(async () => {
    // testWallet = new Wallet(process.env.TREASURY_MANAGER_PK as string);
    await setChainState(forkedBlockNumber);
    const [signer] = await ethers.getSigners();
    balancerVault = new Contract(
      '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
      BalancerVaultABI,
      signer
    ) as BalancerVault;
    // exchangeV3 = new Contract(
    //   '0x61935cbdd02287b511119ddb11aeb42f1593b7ef',
    //   ExchangeV3ABI,
    //   signer,
    // ) as ExchangeV3;
    assets = ['0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', '0xCFEAead4947f0705A14ec42aC3D44129E1Ef3eD5'];
    const pool2TokensFactory = await ethers.getContractAt(factoryABI, '0xA5bf2ddF098bb0Ef6d120C98217dD6B141c74EE0');
    const txn = await (
      await pool2TokensFactory
        .connect(signer)
        .create(
          'Staked NOTE Weighted Pool',
          'sNOTE-BPT',
          assets,
          [ethers.utils.parseEther('0.2'), ethers.utils.parseEther('0.8')],
          ethers.utils.parseEther('0.005'),
          true,
          signer.address
        )
    ).wait();
    const poolAddress = txn.events.find((e) => e.event === 'PoolCreated').args[0];
    balancerPool = (await ethers.getContractAt(poolABI, poolAddress)) as BalancerPool;
    poolId = await balancerPool.getPoolId();
    const initialBalances = [ethers.utils.parseEther('10'), BigNumber.from(100e8)];
    const userData = ethers.utils.defaultAbiCoder.encode(['uint256', 'uint256[]'], [0, initialBalances]);
    noteWhale = await getAccount('0x22341fB5D92D3d801144aA5A925F401A91418A05');
    wethWhale = await getAccount('0x6555e1cc97d3cba6eaddebbcd7ca51d75771e0b8');
    weth = (await ethers.getContractAt(ERC20ABI, assets[0])) as ERC20;
    note = (await ethers.getContractAt(ERC20ABI, assets[1])) as ERC20;
    await weth.connect(wethWhale).transfer(noteWhale.address, ethers.utils.parseEther('1000'));
    await weth.connect(noteWhale).approve(balancerVault.address, ethers.constants.MaxUint256);
    await note.connect(noteWhale).approve(balancerVault.address, ethers.constants.MaxUint256);

    // Initialize the pool
    await balancerVault.connect(noteWhale).joinPool(poolId, noteWhale.address, noteWhale.address, {
      assets,
      maxAmountsIn: initialBalances,
      userData,
      fromInternalBalance: false,
    });
    const totalSupply = await balancerPool.totalSupply();

    system.setStakedNoteParameters({
      poolId,
      coolDownTimeInSeconds: 100,
      redeemWindowSeconds: 500,
      ethBalance: TypedBigNumber.fromBalance(initialBalances[0], 'ETH', false),
      noteBalance: TypedBigNumber.fromBalance(initialBalances[1], 'NOTE', false),
      balancerPoolTotalSupply: totalSupply,
      sNOTEBptBalance: BigNumber.from(totalSupply),
      swapFee: ethers.utils.parseEther('0.005'),
      sNOTETotalSupply: TypedBigNumber.fromBalance(totalSupply, 'sNOTE', false),
    });
  });

  async function joinPool(noteIn: TypedBigNumber, ethIn: TypedBigNumber) {
    const userData = ethers.utils.defaultAbiCoder.encode(['uint256', 'uint256[]'], [1, [ethIn.n, noteIn.n]]);
    await balancerVault.connect(noteWhale).joinPool(poolId, noteWhale.address, noteWhale.address, {
      assets,
      maxAmountsIn: [ethers.utils.parseEther('10000'), ethers.utils.parseEther('10000')],
      userData,
      fromInternalBalance: false,
    });

    const { balances } = await balancerVault.getPoolTokens(poolId);
    const totalSupply = await balancerPool.totalSupply();
    system.setStakedNoteParameters({
      poolId,
      coolDownTimeInSeconds: 100,
      redeemWindowSeconds: 500,
      ethBalance: TypedBigNumber.fromBalance(balances[0], 'ETH', false),
      noteBalance: TypedBigNumber.fromBalance(balances[1], 'NOTE', false),
      balancerPoolTotalSupply: totalSupply,
      sNOTEBptBalance: BigNumber.from(totalSupply),
      swapFee: ethers.utils.parseEther('0.005'),
      sNOTETotalSupply: TypedBigNumber.fromBalance(totalSupply, 'sNOTE', false),
    });
  }

  it('allows entering the pool with minimal slippage', async () => {
    // Attempt to join the pool, calculate the BPT minted
    const noteIn = TypedBigNumber.fromBalance(0, 'NOTE', false);
    const ethIn = TypedBigNumber.fromBalance(ethers.utils.parseEther('10'), 'ETH', false);
    const expectedBPT = StakedNote.getExpectedBPT(noteIn, ethIn);
    const balanceBefore = await balancerPool.balanceOf(noteWhale.address);

    await joinPool(noteIn, ethIn);
    const balanceAfter = await balancerPool.balanceOf(noteWhale.address);
    const diff = balanceAfter.sub(balanceBefore);
    const errorFactor =
      1 - parseFloat(ethers.utils.formatUnits(expectedBPT, 18)) / parseFloat(ethers.utils.formatUnits(diff, 18));
    expect(errorFactor).to.be.lessThan(1e-12);
  });

  it('doubling eth in pool doubles NOTE price', async () => {
    const noteIn = TypedBigNumber.fromBalance(0, 'NOTE', false);
    const ethIn = TypedBigNumber.fromBalance(ethers.utils.parseEther('10'), 'ETH', false);
    const spotPriceBefore = StakedNote.getSpotPrice();
    const expectedPrice = StakedNote.getExpectedPriceImpact(noteIn, ethIn);
    await joinPool(noteIn, ethIn);
    const spotPriceAfter = StakedNote.getSpotPrice();
    // eslint-disable-next-line no-underscore-dangle
    expect(spotPriceAfter._hex).to.equal(expectedPrice._hex);
    expect(spotPriceAfter.div(spotPriceBefore).toNumber()).to.equal(2);
  });

  it('doubling NOTE in pool halves NOTE price', async () => {
    const noteIn = TypedBigNumber.fromBalance(100e8, 'NOTE', false);
    const ethIn = TypedBigNumber.fromBalance(ethers.utils.parseEther('0'), 'ETH', false);
    const spotPriceBefore = StakedNote.getSpotPrice();
    const expectedPrice = StakedNote.getExpectedPriceImpact(noteIn, ethIn);
    await joinPool(noteIn, ethIn);
    const spotPriceAfter = StakedNote.getSpotPrice();
    // eslint-disable-next-line no-underscore-dangle
    expect(spotPriceAfter._hex).to.equal(expectedPrice._hex);
    expect(spotPriceBefore.div(spotPriceAfter).toNumber()).to.equal(2);
  });

  it('adding optimal eth amount does not move price', async () => {
    const noteIn = TypedBigNumber.fromBalance(100e8, 'NOTE', false);
    const ethIn = StakedNote.getOptimumETHForNOTE(noteIn);
    const spotPriceBefore = StakedNote.getSpotPrice();
    const expectedPrice = StakedNote.getExpectedPriceImpact(noteIn, ethIn);
    // eslint-disable-next-line no-underscore-dangle
    expect(spotPriceBefore._hex).to.equal(expectedPrice._hex);
    await joinPool(noteIn, ethIn);
    const spotPriceAfter = StakedNote.getSpotPrice();
    // eslint-disable-next-line no-underscore-dangle
    expect(spotPriceAfter._hex).to.equal(spotPriceBefore._hex);
  });

  // it('submits 0x order correctly', async () => {
  //   const testTS = 1646766841;
  //   const order = new Order(
  //     1,
  //     testTS,
  //     '0x53144559c0d4a3304e2dd9dafbd685247429216d',
  //     '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  //     utils.parseEther('4000'),
  //     utils.parseEther('1'),
  //   );
  //   expect(await order.hash(exchangeV3)).to.equal(
  //     '0x996fe732855bd6b9a9b3a3549775ec3f44f1755aa727e5ebfb326aabbc9540ae',
  //   );
  //   expect(await order.sign(exchangeV3, testWallet)).to.equal(
  // eslint-disable-next-line max-len
  //     '0xe4896c05c16f849c72086787af0c430b0be4b644aa4a8aa0bf3a7ddcf43d370e0ee3bcc79b8610ac47ab22a54bd1d07b7a7f5018cfb400fc596dc99f3a258a731b07',
  //   );
  // });

  it('exits a pool in proportion to redemption amounts', async () => {
    const noteIn = TypedBigNumber.fromBalance(0, 'NOTE', false);
    const ethIn = TypedBigNumber.fromBalance(ethers.utils.parseEther('10'), 'ETH', false);
    await joinPool(noteIn, ethIn);
    const bptExitAmount = await balancerPool.balanceOf(noteWhale.address);
    const { ethClaim, noteClaim } = StakedNote.getRedemptionValue(
      TypedBigNumber.fromBalance(bptExitAmount, 'sNOTE', false)
    );
    const minETH = ethClaim.scale((1 - 0.005) * RATE_PRECISION, RATE_PRECISION);
    const minNOTE = noteClaim.scale((1 - 0.005) * RATE_PRECISION, RATE_PRECISION);

    // Exit pool results in the expected amounts
    const noteBalanceBefore = await note.balanceOf(noteWhale.address);
    const wethBalanceBefore = await weth.balanceOf(noteWhale.address);
    const userData = ethers.utils.defaultAbiCoder.encode(['uint256', 'uint256'], [1, bptExitAmount]);
    await balancerVault.connect(noteWhale).exitPool(poolId, noteWhale.address, noteWhale.address, {
      assets,
      minAmountsOut: [minETH.n, minNOTE.n],
      userData,
      toInternalBalance: false,
    });
    const noteBalanceAfter = await note.balanceOf(noteWhale.address);
    const wethBalanceAfter = await weth.balanceOf(noteWhale.address);

    const noteDiff = noteBalanceAfter.sub(noteBalanceBefore).sub(noteClaim.n).toNumber();
    const ethDiff = wethBalanceAfter.sub(wethBalanceBefore).sub(ethClaim.n).toNumber();
    expect(noteDiff).to.be.lessThan(100);
    expect(ethDiff).to.be.lessThan(100);
  });
});
