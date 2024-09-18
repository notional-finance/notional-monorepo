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
import { StateZeroItemType } from '@notional-finance/notionable';

export const useCardData = (
  selectedTabIndex: number,
  activeToken: string,
  tokenData: any[],
  productGroupData: StateZeroItemType | []
) => {
  const theme = useTheme();
  const selectedNetwork = useSelectedNetwork();

  let cardData: any[] = [];

  if (selectedTabIndex === PORTFOLIO_STATE_ZERO_OPTIONS.EARN) {
    const primeCashData = tokenData[0];
    const fCashData = tokenData[1];
    const nTokenData = tokenData[2];
    cardData = [
      {
        accentTitle: <FormattedMessage defaultMessage={'Passive Yield'} />,
        title: <FormattedMessage defaultMessage={'Lending'} />,
        icon: <BarChartIcon />,
        apy: primeCashData?.apy?.totalAPY,
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
        apy: fCashData?.apy?.totalAPY,
        apyTitle: <FormattedMessage defaultMessage={'As High As'} />,
        symbol: activeToken,
        cardLink: `/lend-fixed/${selectedNetwork}/${activeToken}`,
        bottomLink: `/lend-fixed/${selectedNetwork}`,
        bottomText: 'All Fixed Rate Lending',
        pillData: [
          <FormattedMessage
            defaultMessage={'Early Exit Subject to Liquidity'}
          />,
        ],
      },
      {
        accentTitle: <FormattedMessage defaultMessage={'High yield'} />,
        title: <FormattedMessage defaultMessage={'Provide Liquidity'} />,
        icon: <PieChartIcon />,
        apy: nTokenData?.apy?.totalAPY,
        apyTitle:
          nTokenData?.apy?.incentives &&
          nTokenData?.apy?.incentives?.length > 0 ? (
            <FormattedMessage
              defaultMessage={'{incentiveAPY} Incentive APY'}
              values={{
                incentiveAPY: sumAndFormatIncentives(nTokenData.apy.incentives),
              }}
            />
          ) : (
            <FormattedMessage defaultMessage={'As High As'} />
          ),
        isTotalAPYSuffix:
          (nTokenData?.apy?.incentives &&
            nTokenData?.apy?.incentives?.length > 0) ??
          false,
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
  } else if (selectedTabIndex === PORTFOLIO_STATE_ZERO_OPTIONS.LEVERAGE) {
    const leveragedNToken = tokenData[0];
    const farmingVault = tokenData[1];
    const pointsVault = tokenData[2];

    cardData = [
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
        cardLink: `/${PRODUCTS.LIQUIDITY_LEVERAGED}/${selectedNetwork}/CreateLeveragedNToken/${activeToken}?borrowOption=${leveragedNToken?.debtToken?.id}`,
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
        availableSymbols:
          productGroupData[1]?.length > 0
            ? getAvailableVaults(productGroupData[1])
            : [],
        cardLink: `/${PRODUCTS.VAULTS}/${selectedNetwork}/${farmingVault?.vaultAddress}/CreateVaultPosition?borrowOption=${farmingVault?.debtTokenId}`,
        bottomValue: `Max Leverage: ${farmingVault?.maxLeverageRatio?.toFixed(
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
        availableSymbols:
          productGroupData[2]?.length > 0
            ? getAvailableVaults(productGroupData[2])
            : [],
        cardLink: `/${PRODUCTS.VAULTS}/${selectedNetwork}/${pointsVault?.vaultAddress}/CreateVaultPosition?borrowOption=${pointsVault?.debtTokenId}`,
        bottomValue: `Max Leverage: ${pointsVault?.maxLeverageRatio?.toFixed(
          2
        )}x`,
        bottomLink: `/${PRODUCTS.LEVERAGED_POINTS_FARMING}/${selectedNetwork}`,
        bottomText: 'All Leveraged Points Farming',
        pillData: [
          <FormattedMessage defaultMessage={'Low IL'} />,
          <FormattedMessage defaultMessage={'Pegged Asset Pools'} />,
        ],
      },
    ];
  } else if (selectedTabIndex === PORTFOLIO_STATE_ZERO_OPTIONS.BORROW) {
    const primeDebtData = tokenData[0];
    const fCashDebtData = tokenData[1];

    cardData = [
      {
        accentTitle: <FormattedMessage defaultMessage={'Passive Interest'} />,
        title: <FormattedMessage defaultMessage={'Borrowing'} />,
        icon: <CoinsCircleIcon />,
        apy: primeDebtData?.apy?.totalAPY,
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
        accentTitle: (
          <FormattedMessage defaultMessage={'Guaranteed Interest'} />
        ),
        title: <FormattedMessage defaultMessage={'Fixed Rate Borrowing'} />,
        icon: (
          <CoinsIcon
            sx={{
              fill: 'transparent !important',
              stroke: theme.palette.typography.main,
            }}
          />
        ),
        apy: fCashDebtData?.apy?.totalAPY,
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
  }

  return cardData;
};
