import { useTheme } from '@mui/material';
import { getIncentiveTotals } from '@notional-finance/helpers';
import {
  BarChartIcon,
  BarChartLateralIcon,
  CoinsCircleIcon,
  CoinsIcon,
  PieChartIcon,
  PointsIcon,
  VaultIcon,
} from '@notional-finance/icons';
import {
  useAllMarkets,
  useAllVaults,
  useSelectedNetwork,
} from '@notional-finance/notionable-hooks';
import { PORTFOLIO_STATE_ZERO_OPTIONS, PRODUCTS } from '@notional-finance/util';
import { FormattedMessage } from 'react-intl';
import { useTokenData } from './use-token-data';

export const useCardData = (
  selectedTab: number,
  activeToken: string,
  allTokenData: ReturnType<typeof useTokenData>['allTokenData'],
  availableSymbols: string[]
) => {
  const theme = useTheme();
  const selectedNetwork = useSelectedNetwork();
  const listedVaults = useAllVaults(selectedNetwork);
  const {
    yields: { leveragedVaults },
    getMax,
  } = useAllMarkets(selectedNetwork);

  const activeTokenData = allTokenData[activeToken]?.data
    ? allTokenData[activeToken].data
    : allTokenData[availableSymbols[0]].data;

  const yieldFarmingTokens: string[] = [];
  const pointsFarmingTokens: string[] = [];

  listedVaults.map(({ vaultAddress }) => {
    const y = getMax(
      leveragedVaults.filter((y) => y.token.vaultAddress === vaultAddress)
    );
    if (
      y?.pointMultiples &&
      !pointsFarmingTokens.includes(y?.underlying?.symbol)
    ) {
      pointsFarmingTokens.push(y?.underlying?.symbol);
    } else if (y && !yieldFarmingTokens.includes(y?.underlying?.symbol)) {
      yieldFarmingTokens.push(y?.underlying?.symbol);
    }
    return { yieldFarmingTokens, pointsFarmingTokens };
  });

  const leveragedLiquidityData = activeTokenData?.find(
    (data) => data.product === 'Leveraged Liquidity'
  );
  const leveragedYieldFarming = activeTokenData
    ?.filter(
      (data) =>
        data.product === 'Leveraged Vault' && data.pointMultiples === undefined
    )
    .sort((a, b) => b.totalAPY - a.totalAPY)[0];

  const leveragedPointsFarming = activeTokenData
    ?.filter(
      (data) => data.product === 'Leveraged Vault' && data.pointMultiples
    )
    .sort((a, b) => b.totalAPY - a.totalAPY)[0];

  const earnData = [
    {
      accentTitle: <FormattedMessage defaultMessage={'Passive Yield'} />,
      title: <FormattedMessage defaultMessage={'Lending'} />,
      icon: <BarChartIcon />,
      apy: activeTokenData?.find((data) => data.product === 'Variable Lend')
        ?.totalAPY,
      symbol: activeToken,
      cardLink: `/lend-variable/${selectedNetwork}/${activeToken}`,
      bottomLink: `/lend-variable/${selectedNetwork}`,
      bottomText: 'All Lending',
      pillData: [
        <FormattedMessage defaultMessage={'No Risk of Loss'} />,
        <FormattedMessage defaultMessage={'No Fee'} />,
        <FormattedMessage defaultMessage={'Always Redeemable'} />,
      ],
    },
    {
      accentTitle: <FormattedMessage defaultMessage={'Guaranteed Yield'} />,
      title: <FormattedMessage defaultMessage={'Fixed Rate Lending'} />,
      icon: <BarChartLateralIcon />,
      apy: activeTokenData
        ?.filter((data) => data.product === 'Fixed Lend')
        ?.sort((a, b) => b.totalAPY - a.totalAPY)[0]?.totalAPY,
      apyTitle: <FormattedMessage defaultMessage={'As High As'} />,
      symbol: activeToken,
      cardLink: `/lend-fixed/${selectedNetwork}/${activeToken}`,
      bottomLink: `/lend-fixed/${selectedNetwork}`,
      bottomText: 'All Fixed Rate Lending',
      pillData: [
        <FormattedMessage defaultMessage={'Early Exit Subject to Liquidity'} />,
      ],
    },
    {
      accentTitle: <FormattedMessage defaultMessage={'High yield'} />,
      title: <FormattedMessage defaultMessage={'Provide Liquidity'} />,
      icon: <PieChartIcon />,
      apy: activeTokenData?.find((data) => data.product === 'Provide Liquidity')
        ?.totalAPY,
      apyTitle: getIncentiveTotals(
        activeTokenData?.find((data) => data.product === 'Provide Liquidity')
      ) ? (
        <FormattedMessage
          defaultMessage={'{incentiveAPY} Incentive APY'}
          values={{
            incentiveAPY: getIncentiveTotals(
              activeTokenData?.find(
                (data) => data.product === 'Provide Liquidity'
              )
            ),
          }}
        />
      ) : (
        <FormattedMessage defaultMessage={'As High As'} />
      ),
      isTotalAPYSuffix:
        getIncentiveTotals(
          activeTokenData?.find((data) => data.product === 'Provide Liquidity')
        ) !== undefined,
      symbol: activeToken,
      cardLink: `/liquidity-variable/${selectedNetwork}/${activeToken}`,
      bottomLink: `/liquidity-variable/${selectedNetwork}`,
      bottomText: 'All Provide Liquidity',
      pillData: [
        <FormattedMessage defaultMessage={'Incentives'} />,
        <FormattedMessage defaultMessage={'Possible IL'} />,
        <FormattedMessage defaultMessage={'Possible Illiquidity'} />,
      ],
    },
  ];

  const leveragedData = [
    {
      accentTitle: <FormattedMessage defaultMessage={'NOTE Yield'} />,
      title: <FormattedMessage defaultMessage={'Leveraged Liquidity'} />,
      icon: <PieChartIcon />,
      apy: leveragedLiquidityData?.totalAPY,
      apyTitle: getIncentiveTotals(leveragedLiquidityData) ? (
        <FormattedMessage
          defaultMessage={'{incentiveAPY} Incentive APY'}
          values={{
            incentiveAPY: getIncentiveTotals(leveragedLiquidityData),
          }}
        />
      ) : (
        <FormattedMessage defaultMessage={'As High As'} />
      ),
      isTotalAPYSuffix:
        getIncentiveTotals(leveragedLiquidityData) !== undefined,
      symbol: activeToken,
      cardLink: `/${PRODUCTS.LIQUIDITY_LEVERAGED}/${selectedNetwork}/CreateLeveragedNToken/${leveragedLiquidityData?.underlying?.symbol}?borrowOption=${leveragedLiquidityData?.leveraged?.debtToken?.id}`,
      bottomValue: `Max Leverage: ${leveragedLiquidityData?.leveraged?.maxLeverageRatio?.toFixed(
        2
      )}x`,
      bottomLink: `/${PRODUCTS.LIQUIDITY_LEVERAGED}/${selectedNetwork}`,
      bottomText: 'All Leveraged Liquidity',
      pillData: [
        <FormattedMessage defaultMessage={'Max NOTE Incentives'} />,
        <FormattedMessage defaultMessage={'Possible Illiquidity'} />,
      ],
    },
    {
      accentTitle: <FormattedMessage defaultMessage={'Organic Yield'} />,
      title: <FormattedMessage defaultMessage={'Leveraged Yield Farming'} />,
      icon: <VaultIcon />,
      apy: leveragedYieldFarming?.totalAPY,
      apyTitle: <FormattedMessage defaultMessage={'As High As'} />,
      symbol: activeToken,
      availableSymbols: yieldFarmingTokens,
      cardLink: `/${PRODUCTS.VAULTS}/${selectedNetwork}/${leveragedYieldFarming?.token?.vaultAddress}/CreateVaultPosition?borrowOption=${leveragedYieldFarming?.leveraged?.vaultDebt?.id}`,
      bottomValue: `Max Leverage: ${
        leveragedYieldFarming?.leveraged?.maxLeverageRatio
          ? leveragedYieldFarming?.leveraged?.maxLeverageRatio?.toFixed(2)
          : 0
      }x`,
      bottomLink: `/${PRODUCTS.LEVERAGED_YIELD_FARMING}/${selectedNetwork}`,
      bottomText: 'All Leveraged Yield Farming',
      pillData: [
        <FormattedMessage defaultMessage={'Low IL'} />,
        <FormattedMessage defaultMessage={'Pegged Asset Pools'} />,
      ],
    },
    {
      accentTitle: <FormattedMessage defaultMessage={'Points Yield'} />,
      title: <FormattedMessage defaultMessage={'Leveraged Points Farming'} />,
      icon: <PointsIcon fill={theme.palette.typography.main} />,
      apy: leveragedPointsFarming?.totalAPY,
      apyTitle: <FormattedMessage defaultMessage={'As High as'} />,
      symbol: activeToken,
      availableSymbols: pointsFarmingTokens,
      cardLink: `/${PRODUCTS.VAULTS}/${selectedNetwork}/${leveragedPointsFarming?.token?.vaultAddress}/CreateVaultPosition?borrowOption=${leveragedPointsFarming?.leveraged?.vaultDebt?.id}`,
      bottomValue: `Max Leverage: ${
        leveragedPointsFarming?.leveraged?.maxLeverageRatio
          ? leveragedPointsFarming?.leveraged?.maxLeverageRatio?.toFixed(2)
          : 0
      }x`,
      bottomLink: `/${PRODUCTS.LEVERAGED_POINTS_FARMING}/${selectedNetwork}`,
      bottomText: 'All Leveraged Points Farming',
      pillData: [
        <FormattedMessage defaultMessage={'Low IL'} />,
        <FormattedMessage defaultMessage={'Pegged Asset Pools'} />,
      ],
    },
  ];

  const borrowData = [
    {
      accentTitle: <FormattedMessage defaultMessage={'Passive Interest'} />,
      title: <FormattedMessage defaultMessage={'Borrowing'} />,
      icon: <CoinsCircleIcon />,
      apy: activeTokenData?.find((data) => data.product === 'Variable Borrow')
        ?.totalAPY,
      apyTitle: <FormattedMessage defaultMessage={'As Low As'} />,
      symbol: activeToken,
      cardLink: `/borrow-variable/${selectedNetwork}/${activeToken}`,
      // bottomValue: 'Max LTV: 75%', TODO: Add this back in when we have the data
      bottomLink: `/borrow-variable/${selectedNetwork}`,
      bottomText: 'All Borrowing',
      pillData: [
        <FormattedMessage defaultMessage={'Fully Flexible'} />,
        <FormattedMessage defaultMessage={'Exit Anytime at No Cost'} />,
      ],
    },
    {
      accentTitle: <FormattedMessage defaultMessage={'Guaranteed Interest'} />,
      title: <FormattedMessage defaultMessage={'Fixed Rate Borrowing'} />,
      icon: (
        <CoinsIcon
          sx={{
            fill: 'transparent !important',
            stroke: theme.palette.typography.main,
          }}
        />
      ),
      apy: activeTokenData
        ?.filter((data) => data.product === 'Fixed Borrow')
        ?.sort((a, b) => a.totalAPY - b.totalAPY)[0]?.totalAPY,
      apyTitle: <FormattedMessage defaultMessage={'As Low As'} />,
      symbol: activeToken,
      cardLink: `/borrow-fixed/${selectedNetwork}/${activeToken}`,
      // bottomValue: 'Max LTV: 75%', TODO: Add this back in when we have the data
      bottomLink: `/borrow-fixed/${selectedNetwork}`,
      bottomText: 'All Fixed Rate Borrowing',
      pillData: [
        <FormattedMessage defaultMessage={'Exit Anytime'} />,
        <FormattedMessage defaultMessage={'Entry and Early Exit Fees'} />,
      ],
    },
  ];

  const cardData = {
    [PORTFOLIO_STATE_ZERO_OPTIONS.EARN]: earnData,
    [PORTFOLIO_STATE_ZERO_OPTIONS.LEVERAGE]: leveragedData,
    [PORTFOLIO_STATE_ZERO_OPTIONS.BORROW]: borrowData,
  };

  return cardData[selectedTab];
};
