import { BigNumber, Contract, Signer } from 'ethers';
import { BaseLiquidityPool } from '../../src/exchanges/BaseLiquidityPool';

export abstract class PoolTestHarness<P> {
  constructor(
    public poolInstance: BaseLiquidityPool<P>,
    public poolContract: Contract
  ) {}

  public abstract singleSideEntry(
    signer: Signer,
    entryTokenIndex: number,
    entryTokenAmount: BigNumber
  ): Promise<BigNumber>;

  public abstract singleSideExit(
    signer: Signer,
    exitTokenIndex: number,
    lpTokenAmount: BigNumber
  );

  public abstract multiTokenExit(
    signer: Signer,
    exitTokenIndex: number,
    lpTokenAmount: BigNumber
  );

  // TODO: confirm single sided entry
  // TODO: confirm single sided exit
  // TODO: confirm balanced entry
  // TODO: confirm balanced exit
  // TODO: confirm unbalanced entry
  // TODO: confirm unbalanced exit
  // TODO: confirm trade calculation [small, medium, large]
}
