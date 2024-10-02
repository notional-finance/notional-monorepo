import { defineMessage, FormattedMessage, MessageDescriptor } from 'react-intl';
import { NotionalTheme } from '@notional-finance/styles';
import { useTheme, styled } from '@mui/material';
import { Button } from '@notional-finance/mui';
import { useWalletConnected } from '@notional-finance/notionable-hooks';
import { SETTINGS_SIDE_DRAWERS } from '@notional-finance/util';
import {
  useSideDrawerState,
  useSideDrawerManager,
} from '@notional-finance/notionable-hooks';
import { useLocation, useNavigate } from 'react-router-dom';

export interface TradeActionButtonProps {
  canSubmit: boolean;
  onSubmit?: () => void;
  walletConnectedText?: MessageDescriptor;
  walletNotConnectedText?: MessageDescriptor;
  buttonVariant?: 'text' | 'outlined' | 'contained' | undefined;
  width?: string;
  leverageDisabled?: boolean;
  margin?: string;
}

export interface StyledTradeActionButtonProps {
  width?: string;
  margin?: string;
  theme: NotionalTheme;
  disabled?: boolean;
  canSubmit?: boolean;
}

const StyledTradeActionButton = styled(Button, {
  shouldForwardProp: (prop: string) =>
    prop !== 'width' && prop !== 'margin' && prop !== 'canSubmit',
})(
  ({ theme, width, margin, canSubmit }: StyledTradeActionButtonProps) => `
  width: ${width || '100%'};
  margin: ${margin || ''};
  text-transform: inherit;
  &.MuiButton-root {
    color: ${!canSubmit ? theme.palette.borders.accentPaper : ''};
  }
`
);

export function TradeActionButton({
  canSubmit,
  onSubmit,
  walletConnectedText,
  walletNotConnectedText,
  buttonVariant = 'contained',
  width,
  margin,
  leverageDisabled,
}: TradeActionButtonProps) {
  const theme = useTheme();
  const isWalletConnected = useWalletConnected();
  const { sideDrawerOpen } = useSideDrawerState();
  const { setWalletSideDrawer, clearWalletSideDrawer } = useSideDrawerManager();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const _onSubmit = onSubmit ?? (() => navigate(`${pathname}?confirm=true`));

  const handleConnectWallet = () => {
    if (sideDrawerOpen) {
      clearWalletSideDrawer();
    }
    if (!sideDrawerOpen) {
      setWalletSideDrawer(SETTINGS_SIDE_DRAWERS.CONNECT_WALLET);
    }
  };

  const buttonTextWalletConnected =
    walletConnectedText ||
    defineMessage({
      defaultMessage: 'Continue to Review',
      description: 'call to action button',
    });

  const buttonTextWalletNotConnected =
    walletNotConnectedText ||
    defineMessage({
      defaultMessage: 'Connect Wallet to Trade',
      description: 'call to action button',
    });

  return (
    <StyledTradeActionButton
      theme={theme}
      size="large"
      width={width}
      margin={margin}
      variant={buttonVariant || 'contained'}
      disabled={!isWalletConnected && !leverageDisabled ? false : !canSubmit}
      canSubmit={!isWalletConnected && !leverageDisabled ? true : canSubmit}
      onClick={isWalletConnected ? _onSubmit : () => handleConnectWallet()}
    >
      {leverageDisabled ? (
        <FormattedMessage
          defaultMessage={'Not Available for US Persons or VPN Users'}
        />
      ) : (
        <FormattedMessage
          {...(isWalletConnected
            ? buttonTextWalletConnected
            : buttonTextWalletNotConnected)}
        />
      )}
    </StyledTradeActionButton>
  );
}

export default TradeActionButton;
