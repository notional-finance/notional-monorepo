import { useContext } from 'react';
import { SideDrawerRouter } from '@notional-finance/trade';
import { LiquidityContext } from '../liquidity';
import { PRODUCTS } from '@notional-finance/util';
import { CreateOrIncreasePosition } from './side-drawers';
import { useLeveragedNTokenPositions } from './hooks/use-leveraged-ntoken-positions';
import { useParams } from 'react-router';

export const LiquidityLeveragedSideDrawer = () => {
  const context = useContext(LiquidityContext);
  // NOTE: need to use the URL parameter or infinite loop conditions will exist
  const { selectedDepositToken } = useParams<{
    selectedDepositToken?: string;
  }>();
  const {
    state: {
      customizeLeverage,
      debt,
      availableDebtTokens,
      defaultLeverageRatio,
      deposit,
    },
  } = context;
  const loaded = deposit && deposit?.symbol === selectedDepositToken;
  // TODO: loading condition exists if holdings groups is not properly loaded by the
  // time the account is ready. Need to clear holdings groups on isAccountPending
  // and get at least one calculation before execution here...
  const { currentPosition } = useLeveragedNTokenPositions(selectedDepositToken);

  return (
    <SideDrawerRouter
      context={context}
      hasPosition={!!currentPosition}
      routeMatch={`/${PRODUCTS.LIQUIDITY_LEVERAGED}/:path/${selectedDepositToken}`}
      defaultHasPosition={`IncreaseLeveragedNToken`}
      defaultNoPosition={`CreateLeveragedNToken`}
      routes={[
        {
          isRootDrawer: true,
          slug: 'CreateLeveragedNToken',
          Component: CreateOrIncreasePosition,
          requiredState: {
            tradeType: 'LeveragedNToken',
            debt: loaded
              ? customizeLeverage
                ? debt
                : availableDebtTokens?.find((t) => t.tokenType === 'PrimeDebt')
              : undefined,
            riskFactorLimit:
              loaded && deposit && defaultLeverageRatio && !customizeLeverage
                ? {
                    riskFactor: 'leverageRatio',
                    limit: defaultLeverageRatio,
                    args: [deposit.currencyId],
                  }
                : undefined,
          },
        },
        {
          isRootDrawer: true,
          slug: 'IncreaseLeveragedNToken',
          Component: CreateOrIncreasePosition,
          requiredState: {
            tradeType: 'LeveragedNToken',
            collateral: currentPosition?.asset.token,
            debt: currentPosition?.debt.token,
            riskFactorLimit: currentPosition?.leverageRatio
              ? {
                  riskFactor: 'leverageRatio',
                  limit: currentPosition?.leverageRatio,
                  args: [currentPosition?.asset.currencyId],
                }
              : undefined,
          },
        },
        // {
        //   relPath: 'Manage',
        //   Component: ManagePosition,
        //   requiredState: {
        //     tradeType: 'RollDebt',
        //     collateralBalance
        //     collateral
        //   }
        // }
      ]}
    />
  );
};
