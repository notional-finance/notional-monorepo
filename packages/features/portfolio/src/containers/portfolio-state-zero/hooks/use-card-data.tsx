import { useTheme } from '@mui/material';
import {
  BarChartIcon,
  BarChartLateralIcon,
  CoinsCircleIcon,
  CoinsIcon,
  PendleIcon,
  PieChartIcon,
  PointsIcon,
  VaultIcon,
} from '@notional-finance/icons';
import {
  useCurrentNetworkStore,
  useSelectedNetwork,
} from '@notional-finance/notionable-hooks';
import {
  firstValue,
  PORTFOLIO_STATE_ZERO_OPTIONS,
  PRODUCTS,
  RATE_PRECISION,
  unique,
} from '@notional-finance/util';
import { FormattedMessage } from 'react-intl';
import { sumAndFormatIncentives } from '@notional-finance/shared-web/dashboard-view/hooks/utils';
import { useProductModal } from '@notional-finance/shared-web';
import { APYData } from '@notional-finance/core-entities';
import { NetworkClientModelType } from '@notional-finance/notionable';

const getAvailableVaults = (
  vaults: ReturnType<NetworkClientModelType['getAllListedVaultsWithYield']>,
  currencyId: number
) => {
  return {
    symbols: unique(
      vaults.map((v) => v.underlying?.symbol).filter((t) => t !== undefined)
    ),
    best: vaults
      .filter((v) => v.underlying?.currencyId === currencyId)
      .reduce((max, current) => {
        return (current.apy?.totalAPY || 0) > (max?.apy?.totalAPY || 0)
          ? current
          : max;
      }, undefined as (typeof vaults)[number] | undefined),
  };
};

export const useCardData = (
  selectedTabIndex: number,
  underlyingSymbol: string
) => {
  const theme = useTheme();
  const store = useCurrentNetworkStore();
  const selectedNetwork = useSelectedNetwork();
  const productModalContent = useProductModal();
  const currencyId = store.getTokenBySymbol(underlyingSymbol).currencyId;
  if (!currencyId) return [];

  const tokens = store.getTokensByCurrencyId(currencyId);

  if (selectedTabIndex === PORTFOLIO_STATE_ZERO_OPTIONS.EARN) {
    const primeCashAPY = store.getSpotAPY(store.getPrimeCash(currencyId).id);
    let fCashAPY: APYData | undefined;
    let nTokenAPY: APYData | undefined;
    if (tokens.find((t) => t.tokenType === 'nToken')) {
      nTokenAPY = store.getSpotAPY(store.getNToken(currencyId).id);
      fCashAPY = tokens
        .filter((t) => t.tokenType === 'fCash')
        .map((t) => store.getSpotAPY(t.id))
        .reduce((max, current) => {
          return (current?.totalAPY || 0) > (max?.totalAPY || 0)
            ? current
            : max;
        }, {} as APYData);
    }

    return [
      {
        accentTitle: <FormattedMessage defaultMessage={'Passive Yield'} />,
        title: <FormattedMessage defaultMessage={'Lending'} />,
        icon: <BarChartIcon />,
        apy: primeCashAPY?.totalAPY,
        symbol: underlyingSymbol,
        cardLink: `/lend-variable/${selectedNetwork}/${underlyingSymbol}`,
        bottomLink: `/lend-variable/${selectedNetwork}`,
        bottomText: 'All Lending',
        pillData: [
          <FormattedMessage defaultMessage={'No Risk of Loss'} />,
          <FormattedMessage defaultMessage={'No Fee'} />,
          <FormattedMessage defaultMessage={'Always Redeemable'} />,
        ],
        modalContent: {
          ...productModalContent[PRODUCTS.LEND_VARIABLE],
        },
      },
      {
        accentTitle: <FormattedMessage defaultMessage={'Guaranteed Yield'} />,
        title: <FormattedMessage defaultMessage={'Fixed Rate Lending'} />,
        icon: <BarChartLateralIcon />,
        apy: fCashAPY?.totalAPY,
        apyTitle: <FormattedMessage defaultMessage={'As High As'} />,
        symbol: underlyingSymbol,
        cardLink: `/lend-fixed/${selectedNetwork}/${underlyingSymbol}`,
        bottomLink: `/lend-fixed/${selectedNetwork}`,
        bottomText: 'All Fixed Rate Lending',
        pillData: [
          <FormattedMessage
            defaultMessage={'Early Exit Subject to Liquidity'}
          />,
        ],
        modalContent: {
          ...productModalContent[PRODUCTS.LEND_FIXED],
        },
      },
      {
        accentTitle: <FormattedMessage defaultMessage={'High yield'} />,
        title: <FormattedMessage defaultMessage={'Provide Liquidity'} />,
        icon: <PieChartIcon />,
        apy: nTokenAPY?.totalAPY,
        apyTitle:
          nTokenAPY?.incentives && nTokenAPY?.incentives?.length > 0 ? (
            <FormattedMessage
              defaultMessage={'{incentiveAPY} Incentive APY'}
              values={{
                incentiveAPY: sumAndFormatIncentives(nTokenAPY.incentives),
              }}
            />
          ) : (
            <FormattedMessage defaultMessage={'As High As'} />
          ),
        isTotalAPYSuffix:
          (nTokenAPY?.incentives && nTokenAPY?.incentives?.length > 0) ?? false,
        symbol: underlyingSymbol,
        cardLink: `/liquidity-variable/${selectedNetwork}/${underlyingSymbol}`,
        bottomLink: `/liquidity-variable/${selectedNetwork}`,
        bottomText: 'All Provide Liquidity',
        pillData: [
          <FormattedMessage defaultMessage={'Incentives'} />,
          <FormattedMessage defaultMessage={'Possible IL'} />,
          <FormattedMessage defaultMessage={'Possible Illiquidity'} />,
        ],
        modalContent: {
          ...productModalContent[PRODUCTS.LIQUIDITY_VARIABLE],
        },
      },
    ];
  } else if (selectedTabIndex === PORTFOLIO_STATE_ZERO_OPTIONS.LEVERAGE) {
    const leveragedNToken = firstValue(
      store.getAllLeveragedNTokenYields(currencyId)
    );
    const vaults = store.getAllListedVaultsWithYield();
    const { symbols: availableFarmingVaults, best: bestFarmingVault } =
      getAvailableVaults(
        vaults.filter(
          (v) =>
            v.vaultConfig.vaultType === 'SingleSidedLP_AutoReinvest' ||
            v.vaultConfig.vaultType === 'SingleSidedLP_DirectClaim'
        ),
        currencyId
      );
    const { symbols: availablePointsVaults, best: bestPointsVault } =
      getAvailableVaults(
        vaults.filter(
          (v) => v.vaultConfig.vaultType === 'SingleSidedLP_Points'
        ),
        currencyId
      );

    const { symbols: availablePendleVaults, best: bestPendleVault } =
      getAvailableVaults(
        vaults.filter((v) => v.vaultConfig.vaultType === 'PendlePT'),
        currencyId
      );

    return [
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
        symbol: underlyingSymbol,
        cardLink: `/${PRODUCTS.LIQUIDITY_LEVERAGED}/${selectedNetwork}/CreateLeveragedNToken/${underlyingSymbol}?borrowOption=${leveragedNToken?.debtToken?.id}`,
        bottomValue: `Max Leverage: ${leveragedNToken?.maxLeverageRatio?.toFixed(
          2
        )}x`,
        bottomLink: `/${PRODUCTS.LIQUIDITY_LEVERAGED}/${selectedNetwork}`,
        bottomText: 'All Leveraged Liquidity',
        pillData: [
          <FormattedMessage defaultMessage={'Max NOTE Incentives'} />,
          <FormattedMessage defaultMessage={'Possible Illiquidity'} />,
        ],
        modalContent: {
          ...productModalContent[PRODUCTS.LIQUIDITY_LEVERAGED],
        },
      },
      {
        accentTitle: <FormattedMessage defaultMessage={'Organic Yield'} />,
        title: <FormattedMessage defaultMessage={'Leveraged Yield Farm'} />,
        icon: <VaultIcon />,
        apy: bestFarmingVault?.apy?.totalAPY,
        apyTitle: <FormattedMessage defaultMessage={'As High As'} />,
        symbol: underlyingSymbol,
        availableSymbols: availableFarmingVaults,
        cardLink: `/${PRODUCTS.VAULTS}/${selectedNetwork}/${bestFarmingVault?.vaultConfig.vaultAddress}/CreateVaultPosition?borrowOption=${bestFarmingVault?.debtToken?.id}`,
        bottomValue: `Max Leverage: ${bestFarmingVault?.maxLeverageRatio?.toFixed(
          2
        )}x`,
        bottomLink: `/${PRODUCTS.LEVERAGED_YIELD_FARMING}/${selectedNetwork}`,
        bottomText: 'All Leveraged Yield Farming',
        pillData: [
          <FormattedMessage defaultMessage={'Low IL'} />,
          <FormattedMessage defaultMessage={'Pegged Asset Pools'} />,
        ],
        modalContent: {
          ...productModalContent[PRODUCTS.LEVERAGED_YIELD_FARMING],
        },
      },
      {
        accentTitle: <FormattedMessage defaultMessage={'Points Yield'} />,
        title: <FormattedMessage defaultMessage={'Leveraged Points Farm'} />,
        icon: <PointsIcon fill={theme.palette.typography.main} />,
        apy: bestPointsVault?.apy?.totalAPY,
        apyTitle: <FormattedMessage defaultMessage={'As High as'} />,
        symbol: underlyingSymbol,
        availableSymbols: availablePointsVaults,
        cardLink: `/${PRODUCTS.VAULTS}/${selectedNetwork}/${bestPointsVault?.vaultConfig.vaultAddress}/CreateVaultPosition?borrowOption=${bestPointsVault?.debtToken?.id}`,
        bottomValue: `Max Leverage: ${bestPointsVault?.maxLeverageRatio?.toFixed(
          2
        )}x`,
        bottomLink: `/${PRODUCTS.LEVERAGED_POINTS_FARMING}/${selectedNetwork}`,
        bottomText: 'All Leveraged Points Farming',
        pillData: [
          <FormattedMessage defaultMessage={'Low IL'} />,
          <FormattedMessage defaultMessage={'Pegged Asset Pools'} />,
        ],
        modalContent: {
          ...productModalContent[PRODUCTS.LEVERAGED_POINTS_FARMING],
        },
      },
      {
        accentTitle: <FormattedMessage defaultMessage={'Fixed Yield'} />,
        title: <FormattedMessage defaultMessage={'Leveraged Pendle'} />,
        icon: (
          <PendleIcon
            stroke={theme.palette.typography.main}
            sx={{
              fill: 'transparent !important',
            }}
          />
        ),
        apy: bestPendleVault?.apy?.totalAPY,
        apyTitle: <FormattedMessage defaultMessage={'As High as'} />,
        symbol: underlyingSymbol,
        availableSymbols: availablePendleVaults,
        cardLink: `/${PRODUCTS.VAULTS}/${selectedNetwork}/${bestPendleVault?.vaultConfig.vaultAddress}/CreateVaultPosition?borrowOption=${bestPendleVault?.debtToken?.id}`,
        bottomValue: `Max Leverage: ${bestPendleVault?.maxLeverageRatio?.toFixed(
          2
        )}x`,
        bottomLink: `/${PRODUCTS.LEVERAGED_PENDLE}/${selectedNetwork}`,
        bottomText: 'All Leveraged Pendle',
        pillData: [
          <FormattedMessage defaultMessage={'Possible Illiquidity'} />,
          <FormattedMessage defaultMessage={'Fixed Yield at Maturity'} />,
        ],
        modalContent: {
          ...productModalContent[PRODUCTS.LEVERAGED_PENDLE],
        },
      },
    ];
  } else if (selectedTabIndex === PORTFOLIO_STATE_ZERO_OPTIONS.BORROW) {
    const primeDebtAPY = tokens.find((t) => t.tokenType === 'PrimeDebt')
      ? store.getSpotAPY(store.getPrimeDebt(currencyId).id)
      : undefined;
    const fCashAPY = tokens.find((t) => t.tokenType === 'fCash')
      ? tokens
          .filter((t) => t.tokenType === 'fCash')
          .map((t) => store.getSpotAPY(t.id))
          .reduce(
            (min, current) => {
              return (current?.totalAPY || 0) < (min?.totalAPY || 0)
                ? current
                : min;
            },
            { totalAPY: RATE_PRECISION } as APYData
          )
      : undefined;

    return [
      {
        accentTitle: <FormattedMessage defaultMessage={'Passive Interest'} />,
        title: <FormattedMessage defaultMessage={'Borrowing'} />,
        icon: <CoinsCircleIcon />,
        apy: primeDebtAPY?.totalAPY,
        apyTitle: <FormattedMessage defaultMessage={'As Low As'} />,
        symbol: underlyingSymbol,
        cardLink: `/borrow-variable/${selectedNetwork}/${underlyingSymbol}`,
        // bottomValue: 'Max LTV: 75%', TODO: Add this back in when we have the data
        bottomLink: `/borrow-variable/${selectedNetwork}`,
        bottomText: 'All Borrowing',
        pillData: [
          <FormattedMessage defaultMessage={'Fully Flexible'} />,
          <FormattedMessage defaultMessage={'Exit Anytime at No Cost'} />,
        ],
        modalContent: {
          ...productModalContent[PRODUCTS.BORROW_VARIABLE],
        },
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
        apy: fCashAPY?.totalAPY,
        apyTitle: <FormattedMessage defaultMessage={'As Low As'} />,
        symbol: underlyingSymbol,
        cardLink: `/borrow-fixed/${selectedNetwork}/${underlyingSymbol}`,
        // bottomValue: 'Max LTV: 75%', TODO: Add this back in when we have the data
        bottomLink: `/borrow-fixed/${selectedNetwork}`,
        bottomText: 'All Fixed Rate Borrowing',
        pillData: [
          <FormattedMessage defaultMessage={'Exit Anytime'} />,
          <FormattedMessage defaultMessage={'Entry and Early Exit Fees'} />,
        ],
        modalContent: {
          ...productModalContent[PRODUCTS.BORROW_FIXED],
        },
      },
    ];
  }

  return [];
};
