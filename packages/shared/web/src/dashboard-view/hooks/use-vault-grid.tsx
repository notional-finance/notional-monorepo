import { useState } from 'react';
import {
  useAllVaults,
  useVaultHoldings,
  useAllMarkets,
  useFiat,
} from '@notional-finance/notionable-hooks';
import { useHistory } from 'react-router';
import { DashboardGridProps, DashboardDataProps } from '@notional-finance/mui';
import {
  Network,
  PRIME_CASH_VAULT_MATURITY,
  PRODUCTS,
} from '@notional-finance/util';
import { formatNumberAsAbbr } from '@notional-finance/helpers';
import { defineMessage } from 'react-intl';
import { PointsIcon } from '@notional-finance/icons';
import { Box } from '@mui/material';
import { Registry, getArbBoosts } from '@notional-finance/core-entities';

export const useVaultGrid = (network: Network): DashboardGridProps => {
  const history = useHistory();
  const baseCurrency = useFiat();
  const listedVaults = useAllVaults(network);
  const vaultHoldings = useVaultHoldings(network);
  const [showNegativeYields, setShowNegativeYields] = useState(false);
  const [hasNegativeApy, setHasNegativeApy] = useState(false);
  const {
    yields: { leveragedVaults },
    getMax,
  } = useAllMarkets(network);

  const allVaultData = listedVaults
    .map(({ vaultAddress, name, primaryToken, vaultTVL }) => {
      const y = getMax(
        leveragedVaults.filter((y) => y.token.vaultAddress === vaultAddress)
      );
      const profile = vaultHoldings.find(
        (p) => p.vault.vaultAddress === vaultAddress
      )?.vault;
      const apy = profile?.totalAPY || y?.totalAPY || undefined;
      const points = y?.pointMultiples;
      const vaultShare = Registry.getTokenRegistry().getVaultShare(
        network,
        vaultAddress,
        PRIME_CASH_VAULT_MATURITY
      );
      const pointsBoost = getArbBoosts(vaultShare, false);

      return {
        title: primaryToken.symbol,
        subTitle: name,
        bottomLeftValue: profile
          ? `NET WORTH: ${
              profile?.netWorth().toDisplayStringWithSymbol() || '-'
            }`
          : `TVL: ${
              vaultTVL
                ? formatNumberAsAbbr(vaultTVL.toFiat(baseCurrency).toFloat(), 0)
                : 0
            }`,
        bottomRightValue:
          points && pointsBoost > 0 ? (
            <Box
              sx={{
                display: 'flex',
                fontSize: 'inherit',
                alignItems: 'center',
              }}
            >
              <PointsIcon sx={{ fontSize: 'inherit' }} />
              &nbsp;
              {` ARB/${Object.keys(points).join('/')} Points`}
            </Box>
          ) : points ? (
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
          ) : pointsBoost > 0 ? (
            <Box
              sx={{
                display: 'flex',
                fontSize: 'inherit',
                alignItems: 'center',
              }}
            >
              <PointsIcon sx={{ fontSize: 'inherit' }} />
              &nbsp;
              {` ${pointsBoost}x ARB Points`}
            </Box>
          ) : undefined,
        symbol: primaryToken.symbol,
        network: primaryToken.network,
        hasPosition: profile ? true : false,
        apy: apy || 0,
        routeCallback: () =>
          history.push(
            profile
              ? `/${PRODUCTS.VAULTS}/${network}/${vaultAddress}/IncreaseVaultPosition`
              : `/${PRODUCTS.VAULTS}/${network}/${vaultAddress}/CreateVaultPosition?borrowOption=${y?.leveraged?.vaultDebt?.id}`
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
    .sort((a, b) => b.apy - a.apy);

  const defaultVaultData = allVaultData.filter(
    ({ hasPosition }) => !hasPosition
  );

  const userVaultPositions = allVaultData.filter(
    ({ hasPosition }) => hasPosition
  );

  const negativeApyCheck = (data: DashboardDataProps[]) => {
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
      sectionTitle: userVaultPositions.length > 0 ? 'opportunities' : '',
      data: negativeApyCheck(defaultVaultData),
      hasLeveragedPosition: false,
    },
  ];

  if (userVaultPositions.length > 0) {
    gridData.unshift({
      sectionTitle:
        userVaultPositions.length === 1 ? 'Your position' : 'Your positions',
      data: userVaultPositions,
      hasLeveragedPosition: true,
    });
  }

  const vaultData =
    leveragedVaults && leveragedVaults.length > 0
      ? gridData
      : [{ sectionTitle: '', data: [] }];

  const showNegativeYieldsToggle = defaultVaultData.find(({ apy }) => apy < 0);

  return {
    gridData: vaultData,
    setShowNegativeYields: showNegativeYieldsToggle
      ? setShowNegativeYields
      : undefined,
    showNegativeYields: hasNegativeApy ? showNegativeYields : undefined,
  };
};
