import { Box, styled, useTheme } from '@mui/material';
import { Button } from '../button/button';
import { NotionalTheme } from '@notional-finance/styles';
import { trackEvent } from '@notional-finance/helpers';
import { FormattedMessage } from 'react-intl';
import { useLocation } from 'react-router';

interface ContainerProps {
  theme: NotionalTheme;
  sticky?: boolean;
}

const Container = styled(Box, {
  shouldForwardProp: (prop: string) => prop !== 'sticky',
})(
  ({ theme, sticky }: ContainerProps) => `
  display: inline-flex;
  justify-content: space-between;
  position: ${sticky ? 'sticky' : 'relative'};
  bottom: 0;
  background: ${theme.palette.background.paper};
  box-shadow: 0 -50px 50px -20px ${theme.palette.background.paper};
  padding-top: 20px;
  padding-bottom: 48px;
  ${theme.breakpoints.down('sm')} {
    position: relative;
    box-shadow: none;
    position: relative;
    background: transparent;
  }
`
);

interface ActionSidebarButtonsProps {
  canSubmit?: boolean;
  sticky?: boolean;
  cancelRoute?: string;
  onCancelCallback?: () => void;
  CustomActionButton?: any;
}

export const ActionSidebarButtons = ({
  canSubmit,
  sticky = true,
  cancelRoute,
  onCancelCallback,
  CustomActionButton,
}: ActionSidebarButtonsProps) => {
  const theme = useTheme();
  const { pathname, search } = useLocation();
  const confirmQueryString = search
    ? `${search}&confirm=true`
    : '?confirm=true';
  const confirmRoute = `${pathname}${confirmQueryString}`;

  return (
    <Container sticky={sticky} theme={theme}>
      {CustomActionButton && <CustomActionButton canSubmit={canSubmit} />}
      {!CustomActionButton && (
        <>
          <Box onClick={onCancelCallback}>
            <Button variant="outlined" size="large" to={cancelRoute}>
              <FormattedMessage
                defaultMessage={'Cancel'}
                description="button text"
              />
            </Button>
          </Box>
          <Button
            variant="contained"
            disabled={!canSubmit}
            size="large"
            onClick={() => trackEvent('SUBMIT_TXN', { url: pathname })}
            to={confirmRoute}
          >
            <FormattedMessage
              defaultMessage={'Submit'}
              description="button text"
            />
          </Button>
        </>
      )}
    </Container>
  );
};

export default ActionSidebarButtons;
