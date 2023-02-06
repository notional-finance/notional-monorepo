import { expect } from 'chai';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ethers } from 'hardhat';
import { getAccount, getProvider, setChainState } from './utils';
import { ERC20, ERC20ABI } from '@notional-finance/contracts';
import MetaStable2TokenAura from '../../src/vaults/strategy/balancer/MetaStable2TokenAura';
import MockSystem from '../mocks/MockSystem';
import { System } from '../../src/system';
import { VaultConfig } from '../../src/data';
import { BASIS_POINT } from '../../src/config/constants';
import TypedBigNumber from '../../src/libs/TypedBigNumber';
import { VaultFactory } from '../../src/vaults';

const forkedBlockNumber = 16547700;
const VAULT_ADDRESS = '0xf049b944ec83abb50020774d48a8cf40790996e6';

describe('balancer vault test', () => {
  let wethWhale: SignerWithAddress;
  let weth: ERC20;
  let wstETH: ERC20;

  const system = new MockSystem();
  System.overrideSystem(system);
  MockSystem.overrideSystem(system);
  // after(() => {
  //   system.destroy();
  //   expect(() => System.getSystem()).toThrowError('System not initialized');
  // });
  const vault: VaultConfig = {
    vaultAddress: VAULT_ADDRESS,
    strategy: VaultFactory.getStrategyId('MetaStable2TokenAura'),
    name: 'MetaStable2TokenAura wstETH/ETH',
    primaryBorrowCurrency: 1,
    minAccountBorrowSize: TypedBigNumber.fromBalance(1e8, 'ETH', true),
    minCollateralRatioBasisPoints: 2000 * BASIS_POINT,
    maxDeleverageCollateralRatioBasisPoints: 4000 * BASIS_POINT,
    maxRequiredAccountCollateralRatioBasisPoints: 9000 * BASIS_POINT,
    feeRateBasisPoints: 20 * BASIS_POINT,
    liquidationRatePercent: 104,
    maxBorrowMarketIndex: 2,
    maxPrimaryBorrowCapacity: TypedBigNumber.fromBalance(10_000e8, 'ETH', true),
    totalUsedPrimaryBorrowCapacity: TypedBigNumber.fromBalance(0, 'ETH', true),
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
  let metaStable: MetaStable2TokenAura;

  system.setVault(vault);

  beforeEach(async () => {
    await setChainState(forkedBlockNumber);
    const [signer] = await ethers.getSigners();
    const strategyId = VaultFactory.getStrategyId('MetaStable2TokenAura');
    const { vaultInstance } = await VaultFactory.buildVault(
      strategyId,
      VAULT_ADDRESS,
      getProvider()
    );

    metaStable = vaultInstance as MetaStable2TokenAura;
    wethWhale = await getAccount('0xf04a5cc80b1e94c69b48f5ee68a08cd2f09a7c3e');
    wstETH = (await ethers.getContractAt(
      ERC20ABI,
      metaStable.initParams.poolContext.secondaryToken
    )) as ERC20;
    weth = (await ethers.getContractAt(
      ERC20ABI,
      metaStable.initParams.poolContext.primaryToken
    )) as ERC20;

    // await weth
    //   .connect(wethWhale)
    //   .approve(balancerVault.address, ethers.constants.MaxUint256);

    // balancerVault = new Contract(
    //   '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
    //   BalancerVaultABI,
    //   signer
    // ) as BalancerVault;
    // const [address] = await balancerVault.getPool(poolID);
  });

  it('calculates price exposure', () => {
    const spotPrice = metaStable.getPriceExposure();
    spotPrice.forEach(({ t, priceLevel, priceLevelIndex, lpTokenValue }) =>
      console.log(
        t,
        ': ',
        priceLevel.toExactString(),
        priceLevelIndex,
        lpTokenValue.toExactString()
      )
    );
  });

  // it('calculates the appropriate bpt when joining', async () => {
  //   const { strategyTokens } = metaStable.getStrategyTokensGivenDeposit(
  //     100,
  //     TypedBigNumber.fromBalance(10e8, 'ETH', true)
  //   );
  //   const userData = ethers.utils.defaultAbiCoder.encode(
  //     ['uint256', 'uint256[]', 'uint256'],
  //     [1, [ethers.utils.parseEther('0'), ethers.utils.parseEther('10')], 0]
  //   );
  //   await balancerVault
  //     .connect(wethWhale)
  //     .joinPool(poolID, wethWhale.address, wethWhale.address, {
  //       assets,
  //       maxAmountsIn: [
  //         ethers.utils.parseEther('0'),
  //         ethers.utils.parseEther('10'),
  //       ],
  //       userData,
  //       fromInternalBalance: false,
  //     });
  //   const bptBalance = await balancerPool.balanceOf(wethWhale.address);
  //   const bptMinted = parseFloat(ethers.utils.formatUnits(bptBalance, 18));
  //   expect(strategyTokens.toFloat()).to.be.closeTo(bptMinted, 0.005);
  //   const { amountRedeemed } = metaStable.getRedeemGivenStrategyTokens(
  //     100,
  //     strategyTokens
  //   );
  //   const wethBalanceBefore = await weth.balanceOf(wethWhale.address);
  //   const ethBalanceBefore = await wethWhale.getBalance();
  //   const exitData = ethers.utils.defaultAbiCoder.encode(
  //     ['uint256', 'uint256', 'uint256'],
  //     [0, bptBalance, 1]
  //   );
  //   await balancerVault
  //     .connect(wethWhale)
  //     .exitPool(poolID, wethWhale.address, wethWhale.address, {
  //       assets,
  //       minAmountsOut: [
  //         ethers.utils.parseEther('0'),
  //         ethers.utils.parseEther('9.8'),
  //       ],
  //       userData: exitData,
  //       toInternalBalance: false,
  //     });
  //   console.log('wsteth balance', await wstETH.balanceOf(wethWhale.address));
  //   console.log(
  //     'weth balance',
  //     wethBalanceBefore.sub(await weth.balanceOf(wethWhale.address))
  //   );
  //   console.log(
  //     'eth balance',
  //     ethBalanceBefore.sub(await wethWhale.getBalance())
  //   );
  //   console.log('bpt balance', await balancerPool.balanceOf(wethWhale.address));
  //   console.log(amountRedeemed.toExactString());
  // });
});
