import { useContext } from 'react';
import {
  SideDrawerRouter,
  useLeveragedNTokenPositions,
} from '@notional-finance/trade';
import { LiquidityContext } from '../liquidity';
import { PRODUCTS } from '@notional-finance/util';
import {
  AdjustLeverage,
  CreateOrIncreasePosition,
  ManageLeveragedLiquidity,
  RollMaturity,
  Withdraw,
} from './side-drawers';
import { useParams } from 'react-router';
import { RiskFactorLimit } from '@notional-finance/risk-engine';
import { TokenBalance } from '@notional-finance/core-entities';

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
      defaultLeverageRatio,
      deposit,
      riskFactorLimit,
      selectedNetwork,
    },
  } = context;
  const loaded = deposit && deposit?.symbol === selectedDepositToken;

  const { currentPosition } = useLeveragedNTokenPositions(
    selectedNetwork,
    selectedDepositToken
  );
  const currentPositionState = {
    collateral: currentPosition?.asset.balance.token,
    debt: currentPosition?.debt.balance.token,
    riskFactorLimit: currentPosition?.leverageRatio
      ? ({
          riskFactor: 'leverageRatio',
          limit: currentPosition?.leverageRatio,
          args: [currentPosition?.asset.balance.currencyId],
        } as RiskFactorLimit<'leverageRatio'>)
      : undefined,
  };

  return (
    <SideDrawerRouter
      context={context}
      hasPosition={!!currentPosition}
      routeMatch={`/${PRODUCTS.LIQUIDITY_LEVERAGED}/${selectedNetwork}/:path/${selectedDepositToken}`}
      defaultHasPosition={`IncreaseLeveragedNToken`}
      defaultNoPosition={`CreateLeveragedNToken`}
      routes={[
        {
          isRootDrawer: true,
          slug: 'CreateLeveragedNToken',
          Component: CreateOrIncreasePosition,
          requiredState: {
            tradeType: 'LeveragedNToken',
            debt: loaded ? debt : undefined,
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
            tradeType: 'IncreaseLeveragedNToken',
            selectedDepositToken,
            ...currentPositionState,
            customizeLeverage: true,
          },
        },
        {
          slug: 'Manage',
          Component: ManageLeveragedLiquidity,
          requiredState: {
            tradeType: 'RollDebt',
            ...(currentPosition?.debt.balance.tokenType === 'PrimeDebt'
              ? {
                  collateral: currentPosition?.debt.balance.toPrimeCash().token,
                  collateralBalance: currentPosition?.debt.balance
                    .toPrimeCash()
                    .neg(),
                }
              : {
                  collateral: currentPosition?.debt.balance.token,
                  collateralBalance: currentPosition?.debt.balance.neg(),
                }),
            selectedDepositToken,
            customizeLeverage: true,
          },
        },
        {
          slug: 'RollMaturity',
          Component: RollMaturity,
          requiredState: {
            tradeType: 'RollDebt',
            // Always roll the entire debt when doing roll debt from this
            // screen. Partial rolls will break up the grouping.
            ...(currentPosition?.debt.balance.tokenType === 'PrimeDebt'
              ? {
                  collateral: currentPosition?.debt.balance.toPrimeCash().token,
                  collateralBalance: currentPosition?.debt.balance
                    .toPrimeCash()
                    .neg(),
                }
              : {
                  collateral: currentPosition?.debt.balance.token,
                  collateralBalance: currentPosition?.debt.balance.neg(),
                }),
            customizeLeverage: true,
          },
        },
        {
          slug: 'AdjustLeverage',
          Component: AdjustLeverage,
          requiredState: {
            tradeType: 'LeveragedNTokenAdjustLeverage',
            depositBalance: loaded ? TokenBalance.zero(deposit) : undefined,
            // NOTE: debt and collateral will change based on where the requested
            // leverage ratio sits in relation to the current leverage
            riskFactorLimit: riskFactorLimit
              ? undefined
              : currentPositionState?.riskFactorLimit,
            customizeLeverage: true,
          },
        },
        {
          slug: 'Withdraw',
          Component: Withdraw,
          requiredState: {
            tradeType: 'DeleverageWithdraw',
            // NOTE: during withdraw the debt and asset are flipped
            collateral:
              currentPosition?.debt.balance.tokenType === 'PrimeDebt'
                ? currentPosition?.debt.balance.toPrimeCash().token
                : currentPosition?.debt.balance.token,
            debt: currentPosition?.asset.balance.token,
            riskFactorLimit: currentPositionState?.riskFactorLimit,
            selectedDepositToken,
            customizeLeverage: true,
          },
        },
      ]}
    />
  );
};
