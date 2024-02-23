import { useState } from 'react';
import {
  useAllVaults,
  useVaultHoldings,
  useAllMarkets,
  useFiat,
} from '@notional-finance/notionable-hooks';
import { useHistory } from 'react-router';
import {
  DashboardGridProps,
  DashboardDataProps,
} from '@notional-finance/mui';
import { Network, PRODUCTS } from '@notional-finance/util';
import { formatNumberAsAbbr } from '@notional-finance/helpers';
import { defineMessage } from 'react-intl';

export const useVaultDashboard = (
  network: Network
): DashboardGridProps => {
  const history = useHistory();
  const baseCurrency = useFiat();
  const listedVaults = useAllVaults(network);
  const vaultHoldings = useVaultHoldings(network);
  const [showNegativeYields, setShowNegativeYields] = useState(false);
  const [hasNegativeApy, setHasNegativeApy] = useState(false);
  const {
    yields: { leveragedVaults },
    getMax,
  } = useAllMarkets(Network.ArbitrumOne);

  const allVaultData = listedVaults
    .map(({ vaultAddress, name, primaryToken, vaultTVL }) => {
      const y = getMax(
        leveragedVaults.filter((y) => y.token.vaultAddress === vaultAddress)
      );
      const profile = vaultHoldings.find(
        (p) => p.vault.vaultAddress === vaultAddress
      )?.vault;
      const apy = profile?.totalAPY || y?.totalAPY || undefined;
      
      return {
        title: primaryToken.symbol,
        subTitle: name,
        bottomValue: profile ? `NET WORTH: ${profile?.netWorth().toDisplayStringWithSymbol() || '-'}` : `TVL: ${vaultTVL ? formatNumberAsAbbr(vaultTVL.toFiat(baseCurrency).toFloat(), 0) : 0}`,
        symbol: primaryToken.symbol,
        hasPosition: profile ? true : false,
        apy: apy || 0,
        routeCallback: () => history.push(`/${PRODUCTS.VAULTS}/${network}/${vaultAddress}`),
        apySubTitle: profile ? (
          defineMessage({
            defaultMessage: `Current APY`,
            description: 'subtitle',
          })
        ) : (
          defineMessage({
            defaultMessage: `AS HIGH AS`,
            description: 'subtitle',
          })
        ),
      };
    })
    .sort((a, b) => b.apy - a.apy)

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

  const productData = [
    {
      sectionTitle: '',
      data: negativeApyCheck(defaultVaultData),
      hasLeveragedPosition: false,
    },
  ];

  if (userVaultPositions.length > 0) {
    productData.unshift({
      sectionTitle:
        userVaultPositions.length === 1 ? 'Your position' : 'Your positions',
      data: userVaultPositions,
      hasLeveragedPosition: true,
    });
  }

  const vaultData =
    leveragedVaults && leveragedVaults.length > 0 ? productData : [];

  return {
    productData: vaultData,
    setShowNegativeYields: hasNegativeApy ? setShowNegativeYields : undefined,
    showNegativeYields: hasNegativeApy ? showNegativeYields : undefined,
  };
};
