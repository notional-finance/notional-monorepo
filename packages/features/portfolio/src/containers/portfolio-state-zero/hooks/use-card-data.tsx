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
import { useSelectedNetwork } from '@notional-finance/notionable-hooks';
import { PORTFOLIO_STATE_ZERO_OPTIONS, PRODUCTS } from '@notional-finance/util';
import { FormattedMessage } from 'react-intl';

export const useCardData = (
  selectedTab: number,
  activeToken: string,
  activeTokenData: any[]
) => {
  const theme = useTheme();
  const selectedNetwork = useSelectedNetwork();

  const leveragedLiquidityData = activeTokenData?.find(
    (data) => data.product === 'Leveraged Liquidity'
  );
  const leveragedYieldFarming = activeTokenData?.find(
    (data) => data.product === 'Leveraged Vault'
  );
  const leveragedPointsFarming = activeTokenData?.find(
    (data) => data.product === 'Leveraged Vault' && data.pointMultiples
  );

  const earnData = [
    {
      accentTitle: <FormattedMessage defaultMessage={'Passive Yield'} />,
      title: <FormattedMessage defaultMessage={'Lending'} />,
      icon: <BarChartIcon />,
      apy:
        activeTokenData?.find((data) => data.product === 'Variable Lend')
          ?.totalAPY || 0,
      symbol: activeToken,
      cardLink: `/lend-variable/${selectedNetwork}/${activeToken}`,
      bottomLink: `/lend-variable/${selectedNetwork}`,
      bottomText: 'All Lending',
      pillData: [
        <FormattedMessage defaultMessage={'No Risk of Loss'} />,
        <FormattedMessage defaultMessage={'No Fee'} />,
        <FormattedMessage defaultMessage={'Passive Yield'} />,
      ],
    },
    {
      accentTitle: <FormattedMessage defaultMessage={'Guaranteed Yield'} />,
      title: <FormattedMessage defaultMessage={'Fixed Rate Lending'} />,
      icon: <BarChartLateralIcon />,
      apy:
        activeTokenData
          ?.filter((data) => data.product === 'Fixed Lend')
          ?.sort((a, b) => b.totalAPY - a.totalAPY)[0]?.totalAPY || 0,
      apyTitle: <FormattedMessage defaultMessage={'As High As'} />,
      symbol: activeToken,
      cardLink: `/lend-fixed/${selectedNetwork}/${activeToken}`,
      bottomLink: `/lend-fixed/${selectedNetwork}`,
      bottomText: 'All Fixed Rate Lending',
      pillData: [
        <FormattedMessage defaultMessage={'Yield Certainty'} />,
        <FormattedMessage defaultMessage={'Low Risk'} />,
      ],
    },
    {
      accentTitle: <FormattedMessage defaultMessage={'High yield'} />,
      title: <FormattedMessage defaultMessage={'Provide Liquidity'} />,
      icon: <PieChartIcon />,
      apy:
        activeTokenData?.find((data) => data.product === 'Provide Liquidity')
          ?.totalAPY || 0,
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
      symbol: activeToken,
      cardLink: `/liquidity-variable/${selectedNetwork}/${activeToken}`,
      bottomLink: `/liquidity-variable/${selectedNetwork}`,
      bottomText: 'All Provide Liquidity',
      pillData: [
        <FormattedMessage defaultMessage={'Earn Incentives'} />,
        <FormattedMessage defaultMessage={'Passive Yield'} />,
        <FormattedMessage defaultMessage={'Possible IL'} />,
      ],
    },
  ];

  const leveragedData = [
    {
      accentTitle: <FormattedMessage defaultMessage={'Incentivized Yield'} />,
      title: <FormattedMessage defaultMessage={'Leveraged Liquidity'} />,
      icon: <PieChartIcon />,
      apy: leveragedLiquidityData?.totalAPY || 0,
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
      symbol: activeToken,
      cardLink: `/${PRODUCTS.LIQUIDITY_LEVERAGED}/${selectedNetwork}/CreateLeveragedNToken/${leveragedLiquidityData?.underlying?.symbol}?borrowOption=${leveragedLiquidityData?.leveraged?.debtToken?.id}`,
      bottomValue: `Max Leverage: ${leveragedLiquidityData?.leveraged?.maxLeverageRatio?.toFixed(
        2
      )}x`,
      bottomLink: `/${PRODUCTS.LIQUIDITY_LEVERAGED}/${selectedNetwork}`,
      bottomText: 'All Leveraged Liquidity',
      pillData: [
        <FormattedMessage defaultMessage={'Manageable Risk'} />,
        <FormattedMessage defaultMessage={'Earn Incentives'} />,
      ],
    },
    {
      accentTitle: <FormattedMessage defaultMessage={'High Yield'} />,
      title: <FormattedMessage defaultMessage={'Leveraged Yield Farming'} />,
      icon: <VaultIcon />,
      apy: leveragedYieldFarming?.totalAPY || 0,
      apyTitle: <FormattedMessage defaultMessage={'As High As'} />,
      symbol: activeToken,
      cardLink: `/${PRODUCTS.VAULTS}/${selectedNetwork}/${leveragedYieldFarming?.token?.vaultAddress}/CreateVaultPosition?borrowOption=${leveragedYieldFarming?.leveraged?.vaultDebt?.id}`,
      bottomValue: `Max Leverage: ${
        leveragedYieldFarming?.leveraged?.maxLeverageRatio
          ? leveragedYieldFarming?.leveraged?.maxLeverageRatio?.toFixed(2)
          : 0
      }x`,
      bottomLink: `/${PRODUCTS.LEVERAGED_YIELD_FARMING}/${selectedNetwork}`,
      bottomText: 'All Leveraged Yield Farming',
      pillData: [
        <FormattedMessage defaultMessage={'Maximum Efficiency'} />,
        <FormattedMessage defaultMessage={'Manageable Risk'} />,
      ],
    },
    {
      accentTitle: <FormattedMessage defaultMessage={'Points Earning'} />,
      title: <FormattedMessage defaultMessage={'Leveraged Points Farming'} />,
      icon: <PointsIcon fill={theme.palette.typography.main} />,
      apy: leveragedPointsFarming?.totalAPY || 0,
      apyTitle: <FormattedMessage defaultMessage={'As High as'} />,
      symbol: activeToken,
      cardLink: `/${PRODUCTS.VAULTS}/${selectedNetwork}/${leveragedPointsFarming?.token?.vaultAddress}/CreateVaultPosition?borrowOption=${leveragedPointsFarming?.leveraged?.vaultDebt?.id}`,
      bottomValue: `Max Leverage: ${
        leveragedPointsFarming?.leveraged?.maxLeverageRatio
          ? leveragedPointsFarming?.leveraged?.maxLeverageRatio?.toFixed(2)
          : 0
      }x`,
      bottomLink: `/${PRODUCTS.LEVERAGED_POINTS_FARMING}/${selectedNetwork}`,
      bottomText: 'All Leveraged Points Farming',
      pillData: [
        <FormattedMessage defaultMessage={'Earn Points'} />,
        <FormattedMessage defaultMessage={'High Yield'} />,
        <FormattedMessage defaultMessage={'Points Value'} />,
      ],
    },
  ];

  const borrowData = [
    {
      accentTitle: <FormattedMessage defaultMessage={'Passive Interest'} />,
      title: <FormattedMessage defaultMessage={'Borrowing'} />,
      icon: <CoinsCircleIcon />,
      apy:
        activeTokenData?.find((data) => data.product === 'Variable Borrow')
          ?.totalAPY || 0,
      apyTitle: <FormattedMessage defaultMessage={'As Low As'} />,
      symbol: activeToken,
      cardLink: `/borrow-variable/${selectedNetwork}/${activeToken}`,
      // bottomValue: 'Max LTV: 75%', TODO: Add this back in when we have the data
      bottomLink: `/borrow-variable/${selectedNetwork}`,
      bottomText: 'All Borrowing',
      pillData: [
        <FormattedMessage defaultMessage={'No Risk of Loss'} />,
        <FormattedMessage defaultMessage={'No Fee'} />,
        <FormattedMessage defaultMessage={'Passive Yield'} />,
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
      apy:
        activeTokenData
          ?.filter((data) => data.product === 'Fixed Borrow')
          ?.sort((a, b) => a.totalAPY - b.totalAPY)[0]?.totalAPY || 0,
      apyTitle: <FormattedMessage defaultMessage={'As Low As'} />,
      symbol: activeToken,
      cardLink: `/borrow-fixed/${selectedNetwork}/${activeToken}`,
      // bottomValue: 'Max LTV: 75%', TODO: Add this back in when we have the data
      bottomLink: `/borrow-fixed/${selectedNetwork}`,
      bottomText: 'All Fixed Rate Borrowing',
      pillData: [
        <FormattedMessage defaultMessage={'Yield Certainty'} />,
        <FormattedMessage defaultMessage={'Low Risk'} />,
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
