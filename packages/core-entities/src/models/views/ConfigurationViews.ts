import { Instance } from 'mobx-state-tree';
import { NetworkModel } from '../NetworkModel';
import { BigNumber, ethers } from 'ethers';
import { RATE_PRECISION, SCALAR_PRECISION } from '@notional-finance/util';

interface MorphoLendingRouterParams {
  loanToken: string;
  collateralToken: string;
  oracle: string;
  irm: string;
  lltv: BigNumber;
  marketId: string;
}

export function assertDefined<T>(v: T | null | undefined): T {
  if (v === undefined || v === null) throw Error(`Undefined Value`);
  return v as T;
}

export function decodeMorphoLendingRouterParams(
  params: string
): MorphoLendingRouterParams {
  const [loanToken, collateralToken, oracle, irm, lltv] =
    ethers.utils.defaultAbiCoder.decode(
      ['address', 'address', 'address', 'address', 'uint256'],
      params
    );
  const marketId = ethers.utils.keccak256(params);

  return {
    loanToken,
    collateralToken,
    oracle,
    irm,
    lltv,
    marketId,
  };
}

export const ConfigurationViews = (self: Instance<typeof NetworkModel>) => {
  const getLendingRouters = () => {
    return assertDefined(self.configuration?.lendingRouters);
  };

  const getWithdrawRequestManagers = () => {
    return assertDefined(self.configuration?.withdrawRequestManagers);
  };

  const getMaxLeverageRatio = (vault: string, lendingRouter: string) => {
    const lr = self.configuration?.lendingRouters.find(
      (lr) => lr.id === lendingRouter
    );
    const m = lr?.markets.find((m) => m.vault === vault);

    if (lr?.name === 'Morpho' && m) {
      const marketParams = decodeMorphoLendingRouterParams(m.params);
      const leverageInScalar = SCALAR_PRECISION.mul(SCALAR_PRECISION).div(
        SCALAR_PRECISION.sub(marketParams.lltv)
      );
      return (
        leverageInScalar.mul(RATE_PRECISION).div(SCALAR_PRECISION).toNumber() /
        RATE_PRECISION
      );
    } else {
      throw Error(`Market params for ${vault} on ${lendingRouter} not found`);
    }
  };

  const getLendingRouter = (lendingRouter: string) => {
    return self.configuration?.lendingRouters.find(
      (lr) => lr.id === lendingRouter
    );
  };

  return {
    getLendingRouter,
    getLendingRouters,
    getWithdrawRequestManagers,
    getMaxLeverageRatio,
  };
};
