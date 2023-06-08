import { BigNumber, providers } from 'ethers';
import { FlashLiquidation, IFlashLoanProvider } from '../types';
import {
  AaveFlashLender,
  AaveFlashLender__factory,
} from '@notional-finance/contracts';

export default class AaveFlashLoanProvider implements IFlashLoanProvider {
  private flashLender: AaveFlashLender;

  constructor(
    public flashLenderAddress: string,
    public flashLiquidatorAddress: string,
    public provider: providers.Provider
  ) {
    this.flashLender = AaveFlashLender__factory.connect(
      flashLenderAddress,
      provider
    );
  }

  public async estimateGas(flashLiq: FlashLiquidation): Promise<BigNumber> {
    return this.flashLender.estimateGas.flashLoan(
      this.flashLiquidatorAddress,
      [flashLiq.flashBorrowAsset],
      [flashLiq.accountLiq.flashLoanAmount],
      [BigNumber.from(0)],
      this.flashLiquidatorAddress,
      flashLiq.accountLiq.liquidation.encode(
        flashLiq.accountLiq.accountId,
        true,
        flashLiq.preLiquidationTrade,
        flashLiq.collateralTrade
      ),
      BigNumber.from(0)
    );
  }

  public async encodeTransaction(flashLiq: FlashLiquidation): Promise<string> {
    return this.flashLender.interface.encodeFunctionData('flashLoan', [
      this.flashLiquidatorAddress,
      [flashLiq.flashBorrowAsset],
      [flashLiq.accountLiq.flashLoanAmount],
      [BigNumber.from(0)],
      this.flashLiquidatorAddress,
      flashLiq.accountLiq.liquidation.encode(
        flashLiq.accountLiq.accountId,
        true,
        flashLiq.preLiquidationTrade,
        flashLiq.collateralTrade
      ),
      BigNumber.from(0),
    ]);
  }
}
