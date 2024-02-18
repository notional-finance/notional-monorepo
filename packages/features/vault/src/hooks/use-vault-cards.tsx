import { useState } from 'react';
import {
  useAllVaults,
  useVaultHoldings,
  useAllMarkets,
} from '@notional-finance/notionable-hooks';
import { FormattedMessage, defineMessage } from 'react-intl';
import { TokenIcon } from '@notional-finance/icons';
import { Box, useTheme } from '@mui/material';
import { useHistory } from 'react-router';
import {
  ProductDashboardProps,
  InfoTooltip,
  DashboardDataProps,
} from '@notional-finance/mui';
import { Network } from '@notional-finance/util';
import { formatNumberAsAbbr } from '@notional-finance/helpers';

export const useVaultCards = (network: Network): ProductDashboardProps => {
  const theme = useTheme();
  const history = useHistory();
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
        symbol: primaryToken.symbol,
        hasPosition: profile ? true : false,
        tvl: `TVL: ${vaultTVL ? formatNumberAsAbbr(vaultTVL.toFloat(), 0) : 0}`,
        apy: apy || 0,
        title: name,
        organicApyOnly: true,
        routeCallback: () => history.push(`/vaults/${network}/${vaultAddress}`),
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

  const productData = [
    {
      sectionTitle: 'Recommended',
      data: negativeApyCheck(defaultVaultData),
      hasLeveragedPosition: false,
    },
  ];

  if (userVaultPositions.length > 0) {
    productData.unshift({
      sectionTitle: 'Your position(s)',
      data: userVaultPositions,
      hasLeveragedPosition: true,
    });
  }

  // TODO: refactor this to use actual chain data when the mainnet is ready
  const InfoComponent = () => {
    return (
      <Box
        sx={{
          fontSize: '14px',
          display: 'flex',
        }}
      >
        <Box
          sx={{
            background: theme.palette.background.paper,
            position: 'absolute',
            opacity: 0.5,
            height: '20px',
            width: '100px',
          }}
        ></Box>
        <TokenIcon
          symbol="eth"
          size="small"
          style={{ marginRight: theme.spacing(1) }}
        />
        Mainnet
      </Box>
    );
  };

  const headerData = {
    toggleOptions: [
      <Box sx={{ fontSize: '14px', display: 'flex' }}>
        <TokenIcon
          symbol="arb"
          size="small"
          style={{ marginRight: theme.spacing(1) }}
        />
        Arbitrum
      </Box>,
      <InfoTooltip
        toolTipText={defineMessage({
          defaultMessage: 'Mainnet coming soon',
        })}
        InfoComponent={InfoComponent}
      />,
    ],
    messageBoxText: (
      <FormattedMessage defaultMessage={'Native Token Yield not shown.'} />
    ),
  };

  const vaultData =
    leveragedVaults && leveragedVaults.length > 0 ? productData : [];

  return {
    productData: vaultData,
    setShowNegativeYields: hasNegativeApy ? setShowNegativeYields : undefined,
    showNegativeYields: hasNegativeApy ? showNegativeYields : undefined,
    headerData,
  };
};
