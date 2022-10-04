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
import {
  BalancerLinearPool,
  BalancerBoostedPool,
  BalancerVault,
  ERC20,
} from '@notional-finance/contracts';
import MockSystem from '../mocks/MockSystem';
import { System } from '../../src/system';
import { VaultConfig } from '../../src/data';
import FixedPoint from '../../src/vaults/strategy/balancer/FixedPoint';
import { BASIS_POINT } from '../../src/config/constants';
import TypedBigNumber from '../../src/libs/TypedBigNumber';
import Boosted3TokenAuraVault from '../../src/vaults/strategy/balancer/Boosted3TokenAuraVault';

import ERC20ABI from '../../src/abi/ERC20.json';
import poolABI from '../../src/abi/BalancerBoostedPool.json';
import linearPoolABI from '../../src/abi/BalancerLinearPool.json';
import BalancerVaultABI from '../../src/abi/BalancerVault.json';

const forkedBlockNumber = 15521384;

describe('balancer Boosted vault test', () => {
  const poolID =
    '0x7b50775383d3d6f0215a8f290f2c9e2eebbeceb20000000000000000000000fe';
  let balancerVault: BalancerVault;
  let balancerPool: BalancerBoostedPool;
  let daiLinearPool: BalancerLinearPool;
  let daiWhale: SignerWithAddress;
  let baseAssets: string[];
  let baseBalances: BigNumber[];
  let underlyingBalances: BigNumber[];
  let dai: ERC20;

  const system = new MockSystem();
  System.overrideSystem(system);
  MockSystem.overrideSystem(system);
  const vault: VaultConfig = {
    vaultAddress: '0xabc',
    strategy: '0xstrat',
    name: 'Cross Currency',
    primaryBorrowCurrency: 2,
    minAccountBorrowSize: TypedBigNumber.fromBalance(1e8, 'DAI', true),
    minCollateralRatioBasisPoints: 2000 * BASIS_POINT,
    maxDeleverageCollateralRatioBasisPoints: 4000 * BASIS_POINT,
    feeRateBasisPoints: 20 * BASIS_POINT,
    liquidationRatePercent: 104,
    maxBorrowMarketIndex: 3,
    maxPrimaryBorrowCapacity: TypedBigNumber.fromBalance(10_000e8, 'DAI', true),
    totalUsedPrimaryBorrowCapacity: TypedBigNumber.fromBalance(0, 'DAI', true),
    enabled: true,
    allowRollPosition: false,
    onlyVaultEntry: false,
    onlyVaultExit: false,
    onlyVaultRoll: false,
    onlyVaultDeleverage: false,
    onlyVaultSettle: false,
    allowsReentrancy: true,
    vaultStates: [],
  };
  let boosted: Boosted3TokenAuraVault;

  system.setVault(vault);

  beforeEach(async () => {
    await setChainState(forkedBlockNumber);
    const [signer] = await ethers.getSigners();
    balancerVault = new Contract(
      '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
      BalancerVaultABI,
      signer
    ) as BalancerVault;
    const [address] = await balancerVault.getPool(poolID);

    balancerPool = (await ethers.getContractAt(
      poolABI,
      address
    )) as BalancerBoostedPool;
    daiWhale = await getAccount('0x5d38b4e4783e34e2301a2a36c39a03c45798c4dd');
    ({ tokens: baseAssets, balances: baseBalances } =
      await balancerVault.getPoolTokens(poolID));
    daiLinearPool = (await ethers.getContractAt(
      linearPoolABI,
      baseAssets[2]
    )) as BalancerLinearPool;
    ({ balances: underlyingBalances } = await balancerVault.getPoolTokens(
      await daiLinearPool.getPoolId()
    ));
    dai = (await ethers.getContractAt(
      ERC20ABI,
      await daiLinearPool.getMainToken()
    )) as ERC20;

    await dai
      .connect(daiWhale)
      .approve(balancerVault.address, ethers.constants.MaxUint256);

    const { lowerTarget, upperTarget } = await daiLinearPool.getTargets();

    const initParams: typeof boosted.initParams = {
      strategyContext: {
        totalBPTHeld: FixedPoint.from(0),
        totalStrategyTokensGlobal: FixedPoint.from(0),
      },
      underlyingPoolContext: {
        mainTokenIndex: (await daiLinearPool.getMainIndex()).toNumber(),
        wrappedTokenIndex: (await daiLinearPool.getWrappedIndex()).toNumber(),
        balances: underlyingBalances.map(FixedPoint.from),
      },
      underlyingPoolScalingFactors: (
        await daiLinearPool.getScalingFactors()
      ).map(FixedPoint.from),
      underlyingPoolTotalSupply: FixedPoint.from(
        await daiLinearPool.getVirtualSupply()
      ),
      underlyingPoolParams: {
        fee: FixedPoint.from(await daiLinearPool.getSwapFeePercentage()),
        lowerTarget: FixedPoint.from(lowerTarget),
        upperTarget: FixedPoint.from(upperTarget),
      },
      basePoolContext: {
        poolAddress: address,
        poolId: poolID,
        primaryTokenIndex: 2, // DAI linear pool
        tokenOutIndex: 1, // Boosted pool BPT
        balances: baseBalances.map(FixedPoint.from),
        secondaryTokenIndex: 0, // USDT linear pool
        tertiaryTokenIndex: 3, // USDC linear pool
      },
      basePoolScalingFactors: (await balancerPool.getScalingFactors()).map(
        FixedPoint.from
      ),
      basePoolAmp: FixedPoint.from(
        (await balancerPool.getAmplificationParameter()).value
      ),
      basePoolFee: FixedPoint.from(await balancerPool.getSwapFeePercentage()),
      basePoolTotalSupply: FixedPoint.from(
        await balancerPool.getVirtualSupply()
      ),
    };
    boosted = new Boosted3TokenAuraVault(vault.vaultAddress, initParams);
  });

  it('calculates the appropriate amounts when joining and exiting', async () => {
    const { strategyTokens } = boosted.getStrategyTokensGivenDeposit(
      100,
      TypedBigNumber.fromBalance(1000e8, 'DAI', true),
      0
    );

    await balancerVault.connect(daiWhale).swap(
      {
        poolId: await daiLinearPool.getPoolId(),
        kind: 0,
        assetIn: dai.address,
        assetOut: daiLinearPool.address,
        amount: ethers.utils.parseEther('1000'),
        userData: [],
      },
      {
        sender: daiWhale.address,
        fromInternalBalance: false,
        recipient: daiWhale.address,
        toInternalBalance: false,
      },
      0,
      Date.now() + 20000
    );

    await balancerVault.connect(daiWhale).swap(
      {
        poolId: poolID,
        kind: 0,
        assetIn: daiLinearPool.address,
        assetOut: balancerPool.address,
        amount: await daiLinearPool.balanceOf(daiWhale.address),
        userData: [],
      },
      {
        sender: daiWhale.address,
        fromInternalBalance: false,
        recipient: daiWhale.address,
        toInternalBalance: false,
      },
      0,
      Date.now() + 20000
    );

    const bptMinted = parseFloat(
      ethers.utils.formatUnits(
        await balancerPool.balanceOf(daiWhale.address),
        18
      )
    );
    expect(strategyTokens.toFloat()).to.be.closeTo(bptMinted, 0.005);

    const daiAmountBefore = await dai.balanceOf(daiWhale.address);

    await balancerVault.connect(daiWhale).swap(
      {
        poolId: poolID,
        kind: 0,
        assetIn: balancerPool.address,
        assetOut: daiLinearPool.address,
        amount: await balancerPool.balanceOf(daiWhale.address),
        userData: [],
      },
      {
        sender: daiWhale.address,
        fromInternalBalance: false,
        recipient: daiWhale.address,
        toInternalBalance: false,
      },
      0,
      Date.now() + 20000
    );

    await balancerVault.connect(daiWhale).swap(
      {
        poolId: await daiLinearPool.getPoolId(),
        kind: 0,
        assetIn: daiLinearPool.address,
        assetOut: dai.address,
        amount: await daiLinearPool.balanceOf(daiWhale.address),
        userData: [],
      },
      {
        sender: daiWhale.address,
        fromInternalBalance: false,
        recipient: daiWhale.address,
        toInternalBalance: false,
      },
      0,
      Date.now() + 20000
    );

    const daiAmountOut = parseFloat(
      ethers.utils.formatUnits(
        (await dai.balanceOf(daiWhale.address)).sub(daiAmountBefore),
        18
      )
    );
    const underlyingOut = boosted.getRedeemGivenStrategyTokens(
      100,
      strategyTokens,
      0
    );
    expect(underlyingOut.amountRedeemed.toFloat()).to.be.closeTo(
      daiAmountOut,
      0.005
    );
  });
});
