import {
  useAllVaults,
  useVaultHoldings,
  useAllMarkets,
} from '@notional-finance/notionable-hooks';
import { FormattedMessage, defineMessage } from 'react-intl';
import { TokenIcon } from '@notional-finance/icons';
import { Box, useTheme } from '@mui/material';
import { ProductDashboardProps, InfoTooltip } from '@notional-finance/mui';
import { Network } from '@notional-finance/util';
import {
  formatNumberAsPercent,
  formatNumberAsAbbr,
} from '@notional-finance/helpers';

export const useVaultCards = (network: Network): ProductDashboardProps => {
  const theme = useTheme();
  const listedVaults = useAllVaults(network);
  const vaultHoldings = useVaultHoldings(network);
  const {
    yields: { leveragedVaults },
    getMax,
  } = useAllMarkets(Network.ArbitrumOne);

  const vaultDashBoardData = listedVaults.map(
    ({ vaultAddress, name, primaryToken, vaultTVL }) => {
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
        apy: apy ? formatNumberAsPercent(apy) : '',
        title: name,
        incentiveSymbol: 'ARB',
        incentiveValue: '12.40%',
        organicApyOnly: true,
      };
    }
  );

  const vaultPositions = vaultDashBoardData.filter(
    ({ hasPosition, apy }) => !hasPosition && !apy.includes('-')
  );
  const userVaultPositions = vaultDashBoardData.filter(
    ({ hasPosition }) => hasPosition
  );
  const negativeVaultPositions = vaultDashBoardData.filter(({ apy }) =>
    apy.includes('-')
  );

  const productData = [
    {
      sectionTitle: 'Recommended',
      data: vaultPositions,
      hasLeveragedPosition: false,
      hasNegativePosition: false,
    },
  ];

  if (userVaultPositions.length > 0) {
    productData.unshift({
      sectionTitle: 'Your position(s)',
      data: userVaultPositions,
      hasLeveragedPosition: true,
      hasNegativePosition: false,
    });
  }

  if (negativeVaultPositions.length > 0) {
    productData.push({
      sectionTitle: '',
      data: negativeVaultPositions,
      hasLeveragedPosition: false,
      hasNegativePosition: true,
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

  const test = leveragedVaults && leveragedVaults.length > 0 ? productData : [];

  return {
    productData: test,
    headerData,
  };
};
