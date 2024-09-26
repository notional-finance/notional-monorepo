import { useState } from 'react';
import {
  useAllVaults,
  useVaultHoldings,
  useAppState,
} from '@notional-finance/notionable-hooks';
import { useNavigate } from 'react-router-dom';
import { DashboardGridProps } from '@notional-finance/mui';
import { Network, PRODUCTS } from '@notional-finance/util';
import { formatNumberAsAbbr } from '@notional-finance/helpers';
import { defineMessage } from 'react-intl';
import { PointsIcon } from '@notional-finance/icons';
import { Box } from '@mui/material';

export const useLeveragedVaultGrid = (
  network: Network | undefined,
  vaultProduct: PRODUCTS
): DashboardGridProps => {
  const navigate = useNavigate();
  const { baseCurrency } = useAppState();
  const listedVaults = useAllVaults(network, vaultProduct);
  const vaultHoldings = useVaultHoldings(network);
  const [showNegativeYields, setShowNegativeYields] = useState(false);

  const allVaultData = listedVaults
    .map(({ vaultAddress, name, primaryToken, vaultTVL, maxVaultAPY: y }) => {
      const profile = vaultHoldings.find(
        (p) => p.vault.vaultAddress === vaultAddress
      )?.vault;
      const apy = profile?.totalAPY || y?.totalAPY || 0;
      const points = y?.pointMultiples;

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
        symbol: primaryToken.symbol,
        network: primaryToken.network,
        hasPosition: profile ? true : false,
        apy,
        routeCallback: () =>
          navigate(
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

  const hasNegativeApy = allVaultData.some(({ apy }) => apy < 0);

  const gridData = [
    {
      sectionTitle: userVaultPositions.length > 0 ? 'opportunities' : '',
      data: showNegativeYields
        ? defaultVaultData
        : defaultVaultData.filter(({ apy }) => apy >= 0),
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
    allVaultData && allVaultData.length > 0
      ? gridData
      : [{ sectionTitle: '', data: [] }];

  return {
    gridData: vaultData,
    setShowNegativeYields: hasNegativeApy ? setShowNegativeYields : undefined,
    showNegativeYields: hasNegativeApy ? showNegativeYields : undefined,
  };
};
