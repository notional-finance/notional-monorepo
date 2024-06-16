import { BigNumber, providers } from 'ethers';
import { FlashLiquidation, IFlashLoanProvider } from '../types';
import { Network, getFlashLender } from '@notional-finance/util';
import {
  FlashLiquidator__factory,
  FlashLenderWrapper__factory,
} from '@notional-finance/contracts';

const flashLiquidatorInterface = FlashLiquidator__factory.createInterface();

export default class FlashLenderProvider implements IFlashLoanProvider {
  constructor(
    public network: Network,
    public flashLiquidatorAddress: string,
    public provider: providers.Provider
  ) {}

  public async estimateGas(flashLiq: FlashLiquidation): Promise<BigNumber> {
    const flashLender = FlashLenderWrapper__factory.connect(
      getFlashLender({
        network: this.network,
        token: flashLiq.flashBorrowAsset,
      }),
      this.provider
    );

    return flashLender.estimateGas.flash(
      this.flashLiquidatorAddress,
      flashLiq.flashBorrowAsset,
      flashLiq.accountLiq.flashLoanAmount,
      flashLiq.accountLiq.liquidation.encode(
        flashLiq.accountLiq.accountId,
        true,
        flashLiq.preLiquidationTrade,
        flashLiq.collateralTrade
      ),
      this.flashLiquidatorAddress,
      flashLiquidatorInterface.getSighash('callback')
    );
  }

  public async encodeTransaction(
    flashLiq: FlashLiquidation
  ): Promise<{ data: string; to: string }> {
    const flashLender = FlashLenderWrapper__factory.connect(
      getFlashLender({
        network: this.network,
        token: flashLiq.flashBorrowAsset,
      }),
      this.provider
    );

    return {
      data: flashLender.interface.encodeFunctionData('flash', [
        this.flashLiquidatorAddress,
        flashLiq.flashBorrowAsset,
        flashLiq.accountLiq.flashLoanAmount,
        flashLiq.accountLiq.liquidation.encode(
          flashLiq.accountLiq.accountId,
          true,
          flashLiq.preLiquidationTrade,
          flashLiq.collateralTrade
        ),
        this.flashLiquidatorAddress,
        flashLiquidatorInterface.getSighash('callback'),
      ]),
      to: flashLender.address,
    };
  }
}
