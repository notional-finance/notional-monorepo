import { useContext } from 'react';
import { SideDrawerRouter } from '@notional-finance/trade';
import { LiquidityContext } from '../liquidity';
import { PRODUCTS } from '@notional-finance/util';
import { CreateOrIncreasePosition } from './side-drawers';
import { useLeveragedNTokenPositions } from './hooks/use-leveraged-ntoken-positions';

export const LiquidityLeveragedSideDrawer = () => {
  const context = useContext(LiquidityContext);
  const {
    state: { collateral },
  } = context;
  const { currentPosition } = useLeveragedNTokenPositions(collateral);

  return (
    <SideDrawerRouter
      context={context}
      hasPosition={!!currentPosition}
      rootPath={`/${PRODUCTS.LIQUIDITY_LEVERAGED}`}
      defaultHasPosition={'IncreaseLeveragedNToken'}
      defaultNoPosition={'CreateLeveragedNToken'}
      routes={[
        {
          relPath: 'CreateLeveragedNToken',
          Component: CreateOrIncreasePosition,
          requiredState: {
            tradeType: 'LeveragedNToken',
          },
        },
        {
          relPath: 'IncreaseLeveragedNToken',
          Component: CreateOrIncreasePosition,
          requiredState: {
            tradeType: 'LeveragedNToken',
            collateral: currentPosition?.asset.balance.token,
            debt: currentPosition?.debt.balance.token,
            riskFactorLimit: currentPosition?.leverageRatio
              ? {
                  riskFactor: 'leverageRatio',
                  limit: currentPosition?.leverageRatio,
                  args: [currentPosition?.asset.balance.currencyId],
                }
              : undefined,
          },
        },
      ]}
    />
  );
};
