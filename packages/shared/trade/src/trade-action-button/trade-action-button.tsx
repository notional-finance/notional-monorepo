import { defineMessage, FormattedMessage, MessageDescriptor } from 'react-intl';
import { NotionalTheme } from '@notional-finance/styles';
import { useTheme, styled } from '@mui/material';
import { Button } from '@notional-finance/mui';
import { useAccount, useOnboard } from '@notional-finance/notionable-hooks';
import { useHistory, useLocation } from 'react-router-dom';

/* eslint-disable-next-line */
export interface TradeActionButtonProps {
  canSubmit: boolean;
  onSubmit?: () => void;
  walletConnectedText?: MessageDescriptor;
  walletNotConnectedText?: MessageDescriptor;
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
  text-transform: capitalize;
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
}: TradeActionButtonProps) {
  const theme = useTheme();
  const { accountConnected } = useAccount();
  const { connectWallet } = useOnboard();
  const { pathname } = useLocation();
  const history = useHistory();
  const _onSubmit = onSubmit ?? (() => history.push(`${pathname}?confirm=true`));

  const buttonTextWalletConnected =
    walletConnectedText ||
    defineMessage({
      defaultMessage: 'Confirm & Submit Trade',
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
      disabled={!canSubmit}
      canSubmit={canSubmit}
      onClick={accountConnected ? _onSubmit : () => connectWallet()}
    >
      <FormattedMessage
        {...(accountConnected ? buttonTextWalletConnected : buttonTextWalletNotConnected)}
      />
    </StyledTradeActionButton>
  );
}

export default TradeActionButton;
