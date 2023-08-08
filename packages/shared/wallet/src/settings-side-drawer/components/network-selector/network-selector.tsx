import { TokenIcon } from '@notional-finance/icons';
import { FormattedMessage } from 'react-intl';
import { Chain } from '@web3-onboard/common';
import { NotionalTheme } from '@notional-finance/styles';
import { useTheme, Box, styled } from '@mui/material';
import { Network } from '@notional-finance/util';
import { chains } from '../../../onboard-context';
import { useNotionalContext } from '@notional-finance/notionable-hooks';
import { LabelValue, SideDrawerActiveButton } from '@notional-finance/mui';

/* eslint-disable-next-line */
export interface NetworkSelectorProps {
  networkData?: Chain;
}

export interface NetworkButtonProps {
  active?: boolean;
  theme: NotionalTheme;
}

export const NetworkSettingsButton = () => {
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
  const { updateNotional } = useNotionalContext();

  const handleClick = async (label) => {
    const currentChain = label as Network;
    updateNotional({ selectedNetwork: currentChain });
  };

  return (
    <NetworkWrapper>
      <Title>
        <FormattedMessage defaultMessage={'NETWORK'} />
      </Title>
      {chains.map(({ label, id }: Chain) => {
        const Icon = (
          <TokenIcon
            symbol={id === chains[0].id ? 'arb' : 'eth'}
            size="large"
          />
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

const Title = styled(LabelValue)(
  ({ theme }) => `
  margin-bottom: ${theme.spacing(2.5)};
  font-weight: 700;
  color: ${theme.palette.borders.accentDefault};
  text-transform: uppercase;
  `
);

export default NetworkSelector;
