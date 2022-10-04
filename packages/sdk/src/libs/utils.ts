import { BigNumber, Contract, PopulatedTransaction } from 'ethers';
import { Asset } from '../data';
import { AssetType } from './types';

export async function populateTxnAndGas(
  contract: Contract,
  msgSender: string,
  methodName: string,
  methodArgs: any[],
  gasBufferPercent = 5
) {
  const c = contract.connect(msgSender);
  const [txn, gasLimit]: [PopulatedTransaction, BigNumber] = await Promise.all([
    c.populateTransaction[methodName].apply(c, methodArgs),
    c.estimateGas[methodName].apply(c, methodArgs),
  ]);

  // Add 5% to the estimated gas limit to reduce the risk of out of gas errors
  txn.gasLimit = gasLimit.add(gasLimit.mul(gasBufferPercent).div(100));
  return txn;
}

export function getNowSeconds() {
  const fakeTime = process.env.FAKE_TIME || process.env.NX_FAKE_TIME;
  if (process.env.NODE_ENV === 'development' && fakeTime) {
    const ts = parseInt(fakeTime, 10);
    return ts;
  }

  return Math.floor(new Date().getTime() / 1000);
}

export function convertAssetType(assetType: BigNumber) {
  const typeNum = assetType.toNumber();
  if (typeNum === 1) return AssetType.fCash;
  if (typeNum === 2) return AssetType.LiquidityToken_3Month;
  if (typeNum === 3) return AssetType.LiquidityToken_6Month;
  if (typeNum === 4) return AssetType.LiquidityToken_1Year;
  if (typeNum === 5) return AssetType.LiquidityToken_2Year;
  if (typeNum === 6) return AssetType.LiquidityToken_5Year;
  if (typeNum === 7) return AssetType.LiquidityToken_10Year;
  if (typeNum === 8) return AssetType.LiquidityToken_20Year;

  throw new Error('Unknown asset type');
}

export function assetTypeNum(assetType: AssetType) {
  switch (assetType) {
    case AssetType.fCash:
      return 1;
    case AssetType.LiquidityToken_3Month:
      return 2;
    case AssetType.LiquidityToken_6Month:
      return 3;
    case AssetType.LiquidityToken_1Year:
      return 4;
    case AssetType.LiquidityToken_2Year:
      return 5;
    case AssetType.LiquidityToken_5Year:
      return 6;
    case AssetType.LiquidityToken_10Year:
      return 7;
    case AssetType.LiquidityToken_20Year:
      return 8;
    default:
      throw Error('Unknown asset type');
  }
}

export function hasMatured(asset: Asset, blockTime = getNowSeconds()) {
  return asset.maturity <= blockTime;
}
