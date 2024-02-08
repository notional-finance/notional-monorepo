import { TokenIcon } from '@notional-finance/icons';
import { FormattedMessage } from 'react-intl';
import { NotionalTheme } from '@notional-finance/styles';
import { useTheme, Box, styled } from '@mui/material';
import { Network, getNetworkSymbol } from '@notional-finance/util';
import { chains } from '../../../onboard-context';
import {
  useNotionalContext,
  useWalletConnectedNetwork,
} from '@notional-finance/notionable-hooks';
import { Title } from '../../settings-side-drawer';
import { SideDrawerActiveButton } from '@notional-finance/mui';

export interface NetworkButtonProps {
  active?: boolean;
  theme: NotionalTheme;
}

export const NetworkSettingsButton = () => {
  const theme = useTheme();
  const walletNetwork = useWalletConnectedNetwork();
  const chain = chains.find(({ id }) => id === walletNetwork);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <TokenIcon
        symbol={getNetworkSymbol(walletNetwork) || 'unknown'}
        size="medium"
      />
      <Box sx={{ marginLeft: theme.spacing(1), textDecoration: 'capitalize' }}>
        {chain?.label || walletNetwork}
      </Box>
    </Box>
  );
};

export function NetworkSelector() {
  const { updateNotional } = useNotionalContext();

  const handleClick = async (label: Network) => {
    updateNotional({ selectedNetwork: label });
  };

  return (
    <NetworkWrapper>
      <Title>
        <FormattedMessage defaultMessage={'NETWORK'} />
      </Title>
      {chains.map(({ label, id }) => {
        const Icon = (
          <TokenIcon symbol={getNetworkSymbol(id as Network)} size="large" />
        );
        return (
          <SideDrawerActiveButton
            label={label}
            Icon={Icon}
            dataKey={label ? label : ''}
            callback={handleClick}
            selectedKey={chains[0].label}
            disabled={id === chains[1].id}
          />
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

export default NetworkSelector;
