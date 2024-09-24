import { useState } from 'react';
import { useVaultHoldings } from '@notional-finance/notionable-hooks';
import { useNavigate } from 'react-router-dom';
import { DashboardGridProps } from '@notional-finance/mui';
import { Network, PRODUCTS, VAULT_TYPES } from '@notional-finance/util';
import { formatNumberAsAbbr } from '@notional-finance/helpers';
import { defineMessage } from 'react-intl';
import { PointsIcon } from '@notional-finance/icons';
import { Box } from '@mui/material';
import {
  useCurrentNetworkStore,
  useAppStore,
} from '@notional-finance/notionable';

export const useLeveragedFarmingGrid = (
  network: Network | undefined,
  currentVaultType: VAULT_TYPES
): DashboardGridProps => {
  const navigate = useNavigate();
  const { baseCurrency } = useAppStore();
  const vaultHoldings = useVaultHoldings(network);
  // const totalArbPoints = useTotalArbPoints();
  // const currentSeason = useCurrentSeason();
  const [showNegativeYields, setShowNegativeYields] = useState(false);
  const [hasNegativeApy, setHasNegativeApy] = useState(false);
  const currentNetworkStore = useCurrentNetworkStore();
  const { farmingVaults, pointsVaults } =
    currentNetworkStore.getAllListedVaultsData();

  const yieldData =
    currentVaultType === VAULT_TYPES.LEVERAGED_POINTS_FARMING
      ? pointsVaults
      : farmingVaults;

  const allVaultData = yieldData
    .map(({ vaultData, debtToken, underlying, tvl, apy, token }) => {
      // TODO: Replace with new MOBX account data when ready
      const profile = vaultHoldings.find(
        (p) => p.vault.vaultAddress === token?.vaultAddress
      )?.vault;
      const apyData = profile?.totalAPY || apy?.totalAPY || undefined;
      const points = apy?.pointMultiples;

      return {
        title: underlying?.symbol || '',
        subTitle: vaultData?.name || '',
        bottomLeftValue: profile
          ? `NET WORTH: ${
              profile?.netWorth().toDisplayStringWithSymbol() || '-'
            }`
          : `TVL: ${
              tvl
                ? formatNumberAsAbbr(tvl.toFiat(baseCurrency).toFloat(), 0)
                : 0
            }`,
        bottomRightValue: points ? (
          <Box
            sx={{
              display: 'flex',
              fontSize: 'inherit',
              alignItems: 'center',
            }}
          >
            <PointsIcon sx={{ fontSize: 'inherit' }} />
            &nbsp;
            {` ${Object.keys(points).join('/')} Points`}
          </Box>
        ) : undefined,
        symbol: underlying?.symbol,
        network: underlying?.network,
        hasPosition: profile ? true : false,
        vaultType: points
          ? VAULT_TYPES.LEVERAGED_POINTS_FARMING
          : VAULT_TYPES.LEVERAGED_YIELD_FARMING,
        apy: apyData || 0,
        routeCallback: () =>
          navigate(
            profile
              ? `/${PRODUCTS.VAULTS}/${network}/${vaultData?.vaultAddress}/IncreaseVaultPosition`
              : `/${PRODUCTS.VAULTS}/${network}/${vaultData?.vaultAddress}/CreateVaultPosition?borrowOption=${debtToken?.id}`
          ),
        apySubTitle: profile
          ? defineMessage({
              defaultMessage: `Current APY`,
              description: 'subtitle',
            })
          : defineMessage({
              defaultMessage: `AS HIGH AS`,
              description: 'subtitle',
            }),
      };
    })
    .filter(({ vaultType }) => vaultType === currentVaultType)
    .sort((a, b) => b.apy - a.apy);

  const defaultVaultData = allVaultData.filter(
    ({ hasPosition }) => !hasPosition
  );

  // const userVaultPositions = allVaultData.filter(
  //   ({ hasPosition }) => hasPosition
  // );

  const negativeApyCheck = (data: any[]) => {
    if (!showNegativeYields) {
      return data.filter(({ apy }) => {
        if (apy < 0 && !hasNegativeApy) {
          setHasNegativeApy(true);
        }
        return apy > 0;
      });
    } else {
      return data;
    }
  };

  const gridData = [
    {
      // sectionTitle: userVaultPositions.length > 0 ? 'opportunities' : '',
      sectionTitle: '',
      data: negativeApyCheck(defaultVaultData),
      hasLeveragedPosition: false,
    },
  ];

  // if (userVaultPositions.length > 0) {
  //   gridData.unshift({
  //     sectionTitle:
  //       userVaultPositions.length === 1 ? 'Your position' : 'Your positions',
  //     data: userVaultPositions,
  //     hasLeveragedPosition: true,
  //   });
  // }

  // const vaultData =
  //   leveragedVaults && leveragedVaults.length > 0
  //     ? gridData
  //     : [{ sectionTitle: '', data: [] }];

  const vaultData = gridData;

  const showNegativeYieldsToggle = defaultVaultData.find(({ apy }) => apy < 0);

  return {
    gridData: vaultData,
    setShowNegativeYields: showNegativeYieldsToggle
      ? setShowNegativeYields
      : undefined,
    showNegativeYields: hasNegativeApy ? showNegativeYields : undefined,
  };
};
