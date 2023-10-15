import { useContext } from 'react';
import { SideDrawerRouter } from '@notional-finance/trade';
import { LiquidityContext } from '../liquidity';
import { PRODUCTS } from '@notional-finance/util';
import { CreateOrIncreasePosition } from './side-drawers';
import { useLeveragedNTokenPositions } from './hooks/use-leveraged-ntoken-positions';

export const LiquidityLeveragedSideDrawer = () => {
  const context = useContext(LiquidityContext);
  const {
    state: { selectedDepositToken, tradeType },
    updateState,
  } = context;
  const { currentPosition } = useLeveragedNTokenPositions();

  return (
    <SideDrawerRouter
      currentTradeType={tradeType}
      updateState={updateState}
      hasPosition={!!currentPosition}
      rootPath={`/${PRODUCTS.LIQUIDITY_LEVERAGED}/${selectedDepositToken}`}
      defaultHasPosition={'IncreaseLeveragedNToken'}
      defaultNoPosition={'CreateLeveragedNToken'}
      routes={[
        {
          tradeType: 'CreateLeveragedNToken',
          Component: CreateOrIncreasePosition,
        },
        {
          tradeType: 'IncreaseLeveragedNToken',
          Component: CreateOrIncreasePosition,
          initialState: {
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
