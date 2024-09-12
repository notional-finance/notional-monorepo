import { useTheme } from '@mui/material';
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
import { sumAndFormatIncentives } from '@notional-finance/shared-web/dashboard-view/hooks/utils';
import { getAvailableVaults } from './use-network-token-data';

export const useCardData = (
  selectedTabIndex: number,
  activeToken: string,
  tokenData: any,
  productGroupData: any[]
) => {
  const theme = useTheme();
  const selectedNetwork = useSelectedNetwork();

  const earnData = [
    {
      accentTitle: <FormattedMessage defaultMessage={'Passive Yield'} />,
      title: <FormattedMessage defaultMessage={'Lending'} />,
      icon: <BarChartIcon />,
      apy: tokenData?.find(({ token }) => token.tokenType === 'PrimeCash')?.apy
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
      apy: tokenData?.find(({ token }) => token.tokenType === 'fCash')?.apy
        ?.totalAPY,
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
      apy: tokenData?.find(({ token }) => token.tokenType === 'nToken')?.apy
        ?.totalAPY,
      apyTitle:
        tokenData?.apy?.incentives?.length > 0 ? (
          <FormattedMessage
            defaultMessage={'{incentiveAPY} Incentive APY'}
            values={{
              incentiveAPY: sumAndFormatIncentives(tokenData.apy.incentives),
            }}
          />
        ) : (
          <FormattedMessage defaultMessage={'As High As'} />
        ),
      isTotalAPYSuffix: tokenData?.apy?.incentives?.length > 0 ?? false,
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

  const leveragedNToken = tokenData?.find(
    ({ token }) => token.tokenType === 'nToken'
  );
  const farmingVault = tokenData?.find(
    ({ apy, token }) => !apy?.pointMultiples && token.tokenType === 'VaultShare'
  );
  const pointsVault = tokenData?.find(
    ({ apy, token }) => apy?.pointMultiples && token.tokenType === 'VaultShare'
  );

  const leveragedData = [
    {
      accentTitle: <FormattedMessage defaultMessage={'NOTE Yield'} />,
      title: <FormattedMessage defaultMessage={'Leveraged Liquidity'} />,
      icon: <PieChartIcon />,
      apy: leveragedNToken?.apy?.totalAPY,
      apyTitle: leveragedNToken?.apy.incentives ? (
        <FormattedMessage
          defaultMessage={'{incentiveAPY} Incentive APY'}
          values={{
            incentiveAPY: sumAndFormatIncentives(
              leveragedNToken?.apy.incentives
            ),
          }}
        />
      ) : (
        <FormattedMessage defaultMessage={'As High As'} />
      ),
      isTotalAPYSuffix:
        leveragedNToken?.apy.incentives &&
        leveragedNToken?.apy.incentives.length > 0,
      symbol: activeToken,
      cardLink: `/${PRODUCTS.LIQUIDITY_LEVERAGED}/${selectedNetwork}/CreateLeveragedNToken/${leveragedNToken?.underlying?.symbol}?borrowOption=${leveragedNToken?.debtToken?.id}`,
      bottomValue: `Max Leverage: ${leveragedNToken?.maxLeverageRatio?.toFixed(
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
      apy: farmingVault?.apy?.totalAPY,
      apyTitle: <FormattedMessage defaultMessage={'As High As'} />,
      symbol: activeToken,
      availableSymbols: getAvailableVaults(productGroupData, false),
      cardLink: `/${PRODUCTS.VAULTS}/${selectedNetwork}/${farmingVault?.token?.vaultAddress}/CreateVaultPosition?borrowOption=${farmingVault?.debtToken?.id}`,
      bottomValue: `Max Leverage: ${farmingVault?.maxLeverageRatio.toFixed(
        2
      )}x`,
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
      apy: pointsVault?.apy?.totalAPY,
      apyTitle: <FormattedMessage defaultMessage={'As High as'} />,
      symbol: activeToken,
      availableSymbols: getAvailableVaults(productGroupData, true),
      cardLink: `/${PRODUCTS.VAULTS}/${selectedNetwork}/${pointsVault?.token?.vaultAddress}/CreateVaultPosition?borrowOption=${pointsVault?.debtToken?.id}`,
      bottomValue: `Max Leverage: ${pointsVault?.maxLeverageRatio.toFixed(2)}x`,
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
      apy: tokenData?.find(({ token }) => token.tokenType === 'PrimeDebt')?.apy
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
      apy: tokenData?.find(({ token }) => token.tokenType === 'fCash')?.apy
        ?.totalAPY,
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

  return cardData[selectedTabIndex];
};
