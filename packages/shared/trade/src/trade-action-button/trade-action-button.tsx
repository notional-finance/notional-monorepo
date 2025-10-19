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
import { observer } from 'mobx-react-lite';

/* eslint-disable-next-line */
export interface TradeActionButtonProps {
  canSubmit: boolean;
  onSubmit?: () => void;
  submitText?: MessageDescriptor;
  errorText?: MessageDescriptor;
  buttonVariant?: 'text' | 'outlined' | 'contained' | undefined;
  width?: string;
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

export const TradeActionButton = observer(
  ({
    canSubmit,
    onSubmit,
    submitText,
    errorText,
    buttonVariant = 'contained',
    width,
    margin,
  }: TradeActionButtonProps) => {
    const theme = useTheme();
    const isWalletConnected = useWalletConnected();
    const { sideDrawerOpen } = useSideDrawerState();
    const { setWalletSideDrawer, clearWalletSideDrawer } =
      useSideDrawerManager();
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
      submitText ||
      defineMessage({
        defaultMessage: 'Submit',
        description: 'call to action button',
      });

    const buttonTextWalletNotConnected = defineMessage({
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
        disabled={!isWalletConnected ? false : !canSubmit}
        canSubmit={!isWalletConnected ? true : canSubmit}
        onClick={isWalletConnected ? _onSubmit : () => handleConnectWallet()}
      >
        {isWalletConnected ? (
          errorText ? (
            <FormattedMessage {...errorText} />
          ) : (
            <FormattedMessage {...buttonTextWalletConnected} />
          )
        ) : (
          <FormattedMessage {...buttonTextWalletNotConnected} />
        )}
      </StyledTradeActionButton>
    );
  }
);
