import { TokenIcon } from '@notional-finance/icons';
import { FormattedMessage } from 'react-intl';
import { Chain } from '@web3-onboard/common';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { NotionalTheme } from '@notional-finance/styles';
import { CircleIcon } from '@notional-finance/icons';
import { useTheme, Box, styled, ListItemIcon, Typography } from '@mui/material';
import { Network } from '@notional-finance/util';
import { chains } from '../../onboard-context';
import { H4 } from '@notional-finance/mui';
import { useNetworkSelector } from './use-network-selector';
import { useNotionalContext } from '@notional-finance/notionable-hooks';

/* eslint-disable-next-line */
export interface NetworkSelectorProps {
  networkData?: Chain;
}

export interface NetworkButtonProps {
  active?: boolean;
  theme: NotionalTheme;
}

export const NetworkSelectorButton = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <TokenIcon symbol={'arb'} size="medium" />
      <Box sx={{ marginLeft: theme.spacing(1) }}>{chains[0].label}</Box>
    </Box>
  );
};

export function NetworkSelector() {
  const theme = useTheme();
  const { updateNotional, globalState } = useNotionalContext();
  const { labels } = useNetworkSelector();

  const handleClick = async (chain?: Chain) => {
    if (chain) {
      const currentChain =
        chain.label === 'Arbitrum One' ? Network.ArbitrumOne : Network.Mainnet;
      updateNotional({
        wallet: {
          selectedChain: currentChain,
          selectedAddress: globalState.wallet?.selectedAddress || '',
          isReadOnlyAddress: globalState.wallet?.isReadOnlyAddress,
          hasSelectedChainError: false,
        },
      });
    }
  };

  return (
    <NetworkWrapper>
      <Title>
        <FormattedMessage defaultMessage={'NETWORK'} />
      </Title>
      {chains.map((data: Chain) => {
        const label = data.label ? labels[data.label] : '';
        return (
          <NetworkButton
            key={data.id}
            onClick={
              data.id === chains[0].id ? () => handleClick(data) : undefined
            }
            active={data?.id === chains[0].id}
            theme={theme}
          >
            <ListItemIcon sx={{ marginRight: '0px' }}>
              <TokenIcon
                symbol={data.id === chains[0].id ? 'arb' : 'eth'}
                size="large"
              />
            </ListItemIcon>
            <H4 sx={{ flex: 1, alignItems: 'center', display: 'flex' }}>
              <FormattedMessage {...label} />
            </H4>
            <Box
              sx={{
                justifyContent: 'flex-end',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {chains[0].id === data.id ? (
                <CheckCircleIcon sx={{ fill: theme.palette.primary.main }} />
              ) : (
                <CircleIcon
                  sx={{
                    stroke: theme.palette.borders.accentPaper,
                    width: theme.spacing(2.5),
                    height: theme.spacing(2.5),
                  }}
                />
              )}
            </Box>
          </NetworkButton>
        );
      })}
    </NetworkWrapper>
  );
}

const NetworkWrapper = styled(Box)(
  ({ theme }) => `
    width: 100%;
    margin-bottom: ${theme.spacing(5)};
    ${theme.breakpoints.down('sm')} {
      width: 100%;
      padding: ${theme.spacing(1)};
    }
  `
);

const Title = styled(Typography)(
  ({ theme }) => `
  margin-bottom: ${theme.spacing(2.5)};
  font-weight: 700;
  color: ${theme.palette.borders.accentDefault};
  text-transform: uppercase;
  `
);

const NetworkButton = styled(Box, {
  shouldForwardProp: (prop: string) => prop !== 'active',
})(
  ({ theme, active }: NetworkButtonProps) => `
  width: 100%;
  padding: ${theme.spacing(2)};
  border-radius: ${theme.shape.borderRadius()};
  border: 1px solid ${
    active ? theme.palette.primary.main : theme.palette.borders.paper
  };
  margin: ${theme.spacing(1)} 0px;
  cursor: ${active ? 'pointer' : 'not-allowed'};
  background: ${
    active ? theme.palette.info.light : theme.palette.borders.default
  };
  color: ${theme.palette.primary.dark};
  font-weight: 500;
  display: flex;
  ${theme.breakpoints.down('sm')} {
    width: auto;
  }
  `
);

export default NetworkSelector;
