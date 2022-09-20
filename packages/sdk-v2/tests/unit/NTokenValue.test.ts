import { BigNumber, ethers } from 'ethers';
import { getNowSeconds } from '../../src/libs/utils';
import { RATE_PRECISION, SECONDS_IN_YEAR } from '../../src/config/constants';
import { System, NTokenValue, CashGroup } from '../../src/system';
import MockSystem from '../mocks/MockSystem';
import TypedBigNumber, { BigNumberType } from '../../src/libs/TypedBigNumber';

describe('nToken value', () => {
  const system = new MockSystem();
  System.overrideSystem(system);
  afterAll(() => {
    system.destroy();
  });
  const blockTime = CashGroup.getTimeReference(getNowSeconds());
  const currentTime = getNowSeconds();

  beforeAll(async () => {
    const nETH = system.getNToken(1)!;
    system.setNTokenSupply(1, nETH.totalSupply.scale(1, 2));

    // Set up USDC for incentive calculations
    system.setNTokenSupply(3, TypedBigNumber.from(1_000_000e8, BigNumberType.nToken, 'nUSDC'));
    system.setIncentiveMigration(3, {
      migrationTime: currentTime,
      integralTotalSupply: ethers.constants.WeiPerEther.mul(SECONDS_IN_YEAR),
      migratedEmissionRate: BigNumber.from(100_000), // 100k NOTE per year
    });

    // 1 NOTE per nToken
    system.setIncentiveFactors(3, {
      accumulatedNOTEPerNToken: BigNumber.from(ethers.constants.WeiPerEther),
      lastAccumulatedTime: BigNumber.from(currentTime),
    });

    system.setNTokenEmission(3, BigNumber.from(100_000e8));
  });

  it('converts ntokens to ntoken value', () => {
    const nTokenValue = NTokenValue.convertNTokenToInternalAsset(
      1,
      TypedBigNumber.from(100e8, BigNumberType.nToken, 'nETH'),
      false
    );
    const nTokenValueHaircut = NTokenValue.convertNTokenToInternalAsset(
      1,
      TypedBigNumber.from(100e8, BigNumberType.nToken, 'nETH'),
      true
    );
    expect(nTokenValue.toString()).toEqual(BigNumber.from(200e8).toString());
    expect(nTokenValueHaircut.toString()).toEqual(BigNumber.from(180e8).toString());
  });

  it('gets ntokens to mint', () => {
    const nTokensToMint = NTokenValue.getNTokensToMint(
      1,
      TypedBigNumber.from(100e8, BigNumberType.InternalAsset, 'cETH')
    );
    expect(nTokensToMint.toString()).toEqual(BigNumber.from(50e8).toString());
  });

  it('gets claimable incentives when account requires migration', () => {
    const incentives = NTokenValue.getClaimableIncentives(
      3,
      TypedBigNumber.from(100_000e8, BigNumberType.nToken, 'nUSDC'),
      BigNumber.from(currentTime - SECONDS_IN_YEAR),
      BigNumber.from(ethers.constants.WeiPerEther),
      currentTime
    );

    // Accumulate 1 NOTE under old calculation, accumulate 100k note under new calculation
    expect(incentives.toNumber()).toBeCloseTo(1e8 + 100_000e8, -1);
  });

  it('gets claimable incentives when account has migrated', () => {
    const incentives = NTokenValue.getClaimableIncentives(
      3,
      TypedBigNumber.from(1e8, BigNumberType.nToken, 'nUSDC'),
      BigNumber.from(0), // this means we've migrated
      BigNumber.from(0.5e8)
    );

    // Accumulate 1 NOTE per nToken, with 0.5 NOTE incentive debt
    expect(incentives.toString()).toBe(BigNumber.from(0.5e8).toString());

    const incentives2 = NTokenValue.getClaimableIncentives(
      3,
      TypedBigNumber.from(1e8, BigNumberType.nToken, 'nUSDC'),
      BigNumber.from(0), // this means we've migrated
      BigNumber.from(0.5e8),
      getNowSeconds() + SECONDS_IN_YEAR // Fast forward a year
    );

    // Accumulate another 0.1 NOTE per nToken, with 0.5 NOTE incentive debt
    // emissionRate / totalSupply = 0.1
    expect(incentives2.toString()).toBe(BigNumber.from(0.6e8).toString());
  });

  it('calculates the nToken incentive yield', () => {
    const incentiveYield = NTokenValue.getNTokenIncentiveYield(2);
    expect(incentiveYield / RATE_PRECISION).toBeCloseTo(0.2145);
  });

  it('gets smaller redeem ntoken values (no ifCash)', () => {
    // InterestRateRisk.getNTokenSimulatedValue(TypedBigNumber.fromBalance(100, 'nDAI', true), undefined, blockTime)
    const assetCash = TypedBigNumber.from(100e8, BigNumberType.InternalAsset, 'cDAI');
    const nTokenRedeem = NTokenValue.getNTokenRedeemFromAsset(2, assetCash, blockTime);
    const assetFromRedeem = NTokenValue.getAssetFromRedeemNToken(2, nTokenRedeem, blockTime);
    expect(assetCash.n.toNumber()).toBeCloseTo(assetFromRedeem.n.toNumber(), -3);
  });

  it('gets larger redeem ntoken values (no ifCash)', () => {
    const assetCash = TypedBigNumber.from(500_000e8, BigNumberType.InternalAsset, 'cDAI');
    const nTokenRedeem = NTokenValue.getNTokenRedeemFromAsset(2, assetCash);
    const assetFromRedeem = NTokenValue.getAssetFromRedeemNToken(2, nTokenRedeem);
    expect(assetCash.n.toNumber()).toBeCloseTo(assetFromRedeem.n.toNumber(), -5);
  });

  it('gets larger redeem ntoken values (ifCash)', () => {
    const assetCash = TypedBigNumber.from(500_000e8, BigNumberType.InternalAsset, 'cUSDC');
    const nTokenRedeem = NTokenValue.getNTokenRedeemFromAsset(3, assetCash);
    const assetFromRedeem = NTokenValue.getAssetFromRedeemNToken(3, nTokenRedeem);
    expect(assetCash.n.toNumber()).toBeCloseTo(assetFromRedeem.n.toNumber(), -5);
  });

  it('calculates the nToken blended yield', () => {
    const blendedYield = NTokenValue.getNTokenBlendedYield(2);
    expect(blendedYield / RATE_PRECISION).toBeCloseTo(-0.0067);
  });
});
