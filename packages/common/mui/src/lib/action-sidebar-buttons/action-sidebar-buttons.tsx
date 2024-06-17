import { Box, styled, useTheme } from '@mui/material';
import { Button } from '../button/button';
import { NotionalTheme } from '@notional-finance/styles';
import { FormattedMessage } from 'react-intl';

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
  z-index: 2;
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
  onSubmit: () => void;
  CustomActionButton?: any;
}

export const ActionSidebarButtons = ({
  canSubmit,
  sticky = true,
  cancelRoute,
  onCancelCallback,
  CustomActionButton,
  onSubmit,
}: ActionSidebarButtonsProps) => {
  const theme = useTheme();

  return (
    <Container sticky={sticky} theme={theme}>
      {CustomActionButton && <CustomActionButton canSubmit={canSubmit} />}
      {!CustomActionButton && (
        <Box
          sx={{
            width: '100%',
            display: 'inline-flex',
            justifyContent: 'space-between',
          }}
        >
          <Box onClick={onCancelCallback} sx={{ width: '48%' }}>
            <Button
              variant="outlined"
              size="large"
              to={cancelRoute}
              sx={{ width: '100%' }}
            >
              <FormattedMessage
                defaultMessage={'Cancel'}
                description="button text"
              />
            </Button>
          </Box>
          <Box sx={{ width: '48%' }}>
            <Button
              variant="contained"
              disabled={!canSubmit}
              size="large"
              sx={{ width: '100%' }}
              onClick={onSubmit}
            >
              <FormattedMessage
                defaultMessage={'Submit'}
                description="button text"
              />
            </Button>
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default ActionSidebarButtons;
