import { BigNumber, ethers, Overrides } from 'ethers';
import { BigNumberType, TypedBigNumber } from '..';
import { RATE_PRECISION } from '../config/constants';
import { getNowSeconds, populateTxnAndGas } from '../libs/utils';
import { System } from '../system';
import BalancerPool from './BalancerPool';

export default class StakedNote extends BalancerPool {
  private static async populateTxnAndGas(msgSender: string, methodName: string, methodArgs: any[]) {
    const sNOTE = System.getSystem().getStakedNote();
    return populateTxnAndGas(sNOTE, msgSender, methodName, methodArgs);
  }

  /**
   * Mints sNOTE from ETH and NOTE
   *
   * @param noteAmount amount of NOTE to contribute to the pool (can be zero)
   * @param ethAmount amount of ETH to contribut to the pool (can be zero)
   * @param address address that will send the tokens
   * @param bptSlippagePercent slippage applied to the expected BPT to be minted (default: 0.5%)
   * @param overrides transaction overrides
   * @returns a populated transaction
   */
  public static async mintFromETH(
    noteAmount: TypedBigNumber,
    ethAmount: TypedBigNumber,
    address: string,
    bptSlippagePercent = 0.005,
    overrides = {} as Overrides
  ) {
    const minBPT = StakedNote.getExpectedBPT(noteAmount, ethAmount)
      .mul((1 - bptSlippagePercent) * RATE_PRECISION)
      .div(RATE_PRECISION);
    const ethOverrides = Object.assign(overrides, { value: ethAmount.n }) as ethers.PayableOverrides;

    return StakedNote.populateTxnAndGas(address, 'mintFromETH', [noteAmount.n, minBPT, ethOverrides]);
  }

  /**
   * Mints sNOTE from WETH and NOTE
   *
   * @param noteAmount amount of NOTE to contribute to the pool (can be zero)
   * @param ethAmount amount of ETH to contribut to the pool (can be zero)
   * @param address address that will send the tokens
   * @param bptSlippagePercent slippage applied to the expected BPT to be minted (default: 0.5%)
   * @param overrides transaction overrides
   * @returns a populated transaction
   */
  public static async mintFromWETH(
    noteAmount: TypedBigNumber,
    ethAmount: TypedBigNumber,
    address: string,
    bptSlippagePercent = 0.005,
    overrides = {} as Overrides
  ) {
    if (!ethAmount.isWETH) throw Error('Input is not WETH');
    const minBPT = StakedNote.getExpectedBPT(noteAmount, ethAmount)
      .mul((1 - bptSlippagePercent) * RATE_PRECISION)
      .div(RATE_PRECISION);
    return StakedNote.populateTxnAndGas(address, 'mintFromWETH', [noteAmount.n, ethAmount.n, minBPT, overrides]);
  }

  /**
   * An amount of sNOTE to redeem
   *
   * @param sNOTEAmount amount of sNOTE to redeem
   * @param address address to redeem the sNOTE
   * @param blockTime current time to assess the redemption window
   * @param overrides
   * @returns a populated transaction
   */
  public static async redeem(
    sNOTEAmount: TypedBigNumber,
    address: string,
    redeemWETH: boolean,
    blockTime = getNowSeconds(),
    slippagePercent = 0.005,
    overrides = {} as Overrides
  ) {
    const { ethClaim, noteClaim } = StakedNote.getRedemptionValue(sNOTEAmount);
    const minETH = ethClaim.scale((1 - slippagePercent) * RATE_PRECISION, RATE_PRECISION);
    const minNOTE = noteClaim.scale((1 - slippagePercent) * RATE_PRECISION, RATE_PRECISION);

    if (!StakedNote.canAccountRedeem(address, blockTime)) {
      throw Error(`Account ${address} not in redemption window`);
    }

    return StakedNote.populateTxnAndGas(address, 'redeem', [sNOTEAmount.n, minETH.n, minNOTE.n, redeemWETH, overrides]);
  }

  /**
   * Returns the pool tokens for a given sNOTEAmount
   */
  public static getPoolTokenShare(sNOTEAmount: TypedBigNumber) {
    sNOTEAmount.checkType(BigNumberType.sNOTE);
    const { sNOTETotalSupply, sNOTEBptBalance } = System.getSystem().getStakedNoteParameters();
    // All three of these factors are in 1e18 decimals
    return sNOTEBptBalance.mul(sNOTEAmount.n).div(sNOTETotalSupply.n);
  }

  /**
   * Amount of ETH and NOTE an amount of sNOTE can redeem
   */
  public static getRedemptionValue(sNOTEAmount: TypedBigNumber) {
    sNOTEAmount.checkType(BigNumberType.sNOTE);
    const { ethBalance, noteBalance, balancerPoolTotalSupply } = System.getSystem().getStakedNoteParameters();
    const bptTokenClaim = this.getPoolTokenShare(sNOTEAmount);
    // BPTs are a ratio of the balances held in the pool:
    // https://github.com/officialnico/balancerv2cad/blob/main/src/balancerv2cad/WeightedMath.py#L194-L198
    return {
      ethClaim: ethBalance.scale(bptTokenClaim, balancerPoolTotalSupply),
      noteClaim: noteBalance.scale(bptTokenClaim, balancerPoolTotalSupply),
    };
  }

  /**
   * Starts a cool down for the given address
   * @param address address of the cool down to initiate
   */
  public static async startCoolDown(address: string, overrides = {} as Overrides) {
    return StakedNote.populateTxnAndGas(address, 'startCoolDown', [overrides]);
  }

  /**
   * Stops a cool down for the given address
   * @param address address of the cool down to stop
   */
  public static async stopCoolDown(address: string, overrides = {} as Overrides) {
    return StakedNote.populateTxnAndGas(address, 'stopCoolDown', [overrides]);
  }

  /**
   * Returns account cool down parameters
   * @param address account address
   * @param _blockTime
   * @returns isInCoolDown true if the account is in cool down
   * @returns isInRedeemWindow true if the account is in the redeem window
   * @returns redeemWindowBegin when the account can begin to redeem sNOTE
   * @returns redeemWindowEnd when the redeem window will end
   */
  public static async accountCoolDown(address: string, _blockTime = getNowSeconds()) {
    const { redeemWindowSeconds } = System.getSystem().getStakedNoteParameters();
    const sNOTE = System.getSystem().getStakedNote();
    const redeemWindowBegin = await sNOTE.accountRedeemWindowBegin(address);
    const redeemWindowEnd = redeemWindowBegin.add(redeemWindowSeconds);

    const blockTime = BigNumber.from(_blockTime);
    const isInCoolDown = blockTime.lt(redeemWindowBegin);
    const isInRedeemWindow = redeemWindowBegin.lte(blockTime) && blockTime.lte(redeemWindowEnd);

    return {
      isInCoolDown,
      isInRedeemWindow,
      redeemWindowBegin,
      redeemWindowEnd,
    };
  }

  /**
   * Whether or not the account can redeem
   * @param address account address
   * @param blockTime
   * @returns true if the account can redeem
   */
  public static async canAccountRedeem(address: string, blockTime = getNowSeconds()) {
    const { redeemWindowBegin, redeemWindowEnd } = await StakedNote.accountCoolDown(address, blockTime);
    return !redeemWindowBegin.isZero() && redeemWindowBegin.lte(blockTime) && redeemWindowEnd.gte(blockTime);
  }
}
