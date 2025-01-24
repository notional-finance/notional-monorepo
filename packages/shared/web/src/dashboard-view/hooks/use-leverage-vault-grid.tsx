import { useState } from 'react';
import {
  useAllVaults,
  useVaultHoldings,
} from '@notional-finance/notionable-hooks';
import { DashboardGridProps } from '@notional-finance/mui';
import { Network, PRODUCTS } from '@notional-finance/util';
import { formatNumberAsAbbr } from '@notional-finance/helpers';
import { AutoReinvestIcon, DirectIcon } from '@notional-finance/icons';
import { useAppStore } from '@notional-finance/notionable-hooks';
import { defineMessage } from 'react-intl';
import { VaultType } from '@notional-finance/core-entities';

export const useLeveragedVaultGrid = (
  network: Network | undefined,
  vaultProduct: PRODUCTS
): DashboardGridProps => {
  const { baseCurrency, isMobileView } = useAppStore();
  const listedVaults = useAllVaults(vaultProduct);
  const vaultHoldings = useVaultHoldings(network);
  const [showNegativeYields, setShowNegativeYields] = useState(false);

  const allVaultData = listedVaults
    .map(({ vaultConfig, apy, tvl, debtToken }) => {
      const holding = vaultHoldings?.find(
        (p) => p.vaultAddress === vaultConfig.vaultAddress
      );
      const totalAPY = holding?.apyData?.totalAPY || apy?.totalAPY || 0;
      const points = apy?.pointMultiples;

      return {
        title: vaultConfig.primaryToken.symbol,
        subTitle: vaultConfig.name,
        bottomRightValue: holding
          ? `NET WORTH: ${holding?.netWorth.toDisplayStringWithSymbol() || '-'}`
          : `TVL: ${
              tvl
                ? formatNumberAsAbbr(tvl.toFiat(baseCurrency).toFloat(), 0)
                : 0
            }`,
        bottomLeftValue: undefined,
        symbol: vaultConfig.primaryToken.symbol,
        network: vaultConfig.primaryToken.network,
        hasPosition: holding ? true : false,
        apy: totalAPY,
        view: holding
          ? `/${PRODUCTS.VAULTS}/${network}/${vaultConfig.vaultAddress}/IncreaseVaultPosition`
          : `/${PRODUCTS.VAULTS}/${network}/${vaultConfig.vaultAddress}/CreateVaultPosition?borrowOption=${debtToken?.id}`,
        reinvestOptions:
          vaultConfig.vaultType === 'SingleSidedLP_DirectClaim'
            ? {
                Icon: DirectIcon,
                label: defineMessage({
                  defaultMessage: 'Direct Claim',
                  description: 'Direct Claim',
                }),
              }
            : vaultConfig.vaultType === 'SingleSidedLP_AutoReinvest'
            ? {
                Icon: AutoReinvestIcon,
                label: defineMessage({
                  defaultMessage: 'Auto-Reinvest',
                  description: 'Auto Reinvest',
                }),
              }
            : undefined,

        reinvestmentTypeString: vaultConfig.vaultType as VaultType | undefined,
        vaultUtilization: vaultConfig.vaultUtilization,
        rewardTokens: vaultConfig.rewardTokens.map((t) => t.symbol),
        apySubTitle:
          vaultConfig.vaultType === 'PendlePT' && isMobileView
            ? defineMessage({
                defaultMessage: 'MAX APY',
                description: 'Pendle PT mobile subtitle',
              })
            : undefined,
        vaultType:
          vaultConfig.vaultType === 'SingleSidedLP_DirectClaim' ||
          vaultConfig.vaultType === 'SingleSidedLP_AutoReinvest'
            ? vaultConfig.vaultType
            : undefined,
        pointsSubTitle: points
          ? ` ${Object.keys(points).join('/')} Points`
          : undefined,
      };
    })
    .sort((a, b) => (b.apy || 0) - (a.apy || 0));

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
