import {
  Box,
  Divider,
  Modal as MuiModal,
  styled,
  useTheme,
  alpha,
  Backdrop,
} from '@mui/material';
import { CloseX, InfoIcon, TokenIcon } from '@notional-finance/icons';
import {
  Body,
  Button,
  LabelValue,
  LargeInputTextEmphasized,
} from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';

export const ApprovalModal = ({
  isOpen = false,
  onDismiss,
}: {
  isOpen: boolean;
  onDismiss: () => void;
}) => {
  const theme = useTheme();

  // Need the following versions:
  // Token Approval only
  // Morpho Approval only
  // Token Approval + Morpho Approval
  // Pending Approval
  // All Approvals Successful
  // Transaction Pending
  // Transaction Failed
  // Transaction Success

  return (
    <MuiModal
      open={isOpen}
      slots={{
        backdrop: Backdrop,
      }}
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: alpha(theme.palette.common.black, 0.5),
          },
          onClick: onDismiss,
        },
      }}
    >
      <Container>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'top',
          }}
        >
          <InfoIcon
            sx={{ fontSize: theme.spacing(5) }}
            fill={theme.palette.warning.main}
          />
          <CloseX
            sx={{ fontSize: theme.spacing(2), cursor: 'pointer' }}
            stroke={theme.palette.text.primary}
            onClick={onDismiss}
          />
        </Box>
        <LargeInputTextEmphasized>
          <FormattedMessage defaultMessage="System Approval" />
        </LargeInputTextEmphasized>
        <Body>
          <FormattedMessage defaultMessage="Notional requires the following approvals. You will only have to do this once." />
        </Body>
        <Divider />
        <Box
          sx={{ display: 'flex', alignItems: 'center', flexDirection: 'row' }}
        >
          <Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                flexDirection: 'row',
                gap: theme.spacing(1),
                marginBottom: theme.spacing(1),
              }}
            >
              <TokenIcon symbol="USDC" size="medium" />
              <LabelValue>
                <FormattedMessage defaultMessage="USDC Disabled" />
              </LabelValue>
            </Box>
            <Body>
              <FormattedMessage defaultMessage="Enabling a currency is required for Notional to access funds in your wallet." />
            </Body>
          </Box>
          <Button size="small">Enable</Button>
        </Box>
        <Divider />
        <Box
          sx={{ display: 'flex', alignItems: 'center', flexDirection: 'row' }}
        >
          <Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                flexDirection: 'row',
                gap: theme.spacing(1),
                marginBottom: theme.spacing(1),
              }}
            >
              <TokenIcon symbol="WBTC" size="medium" />
              <LabelValue>
                <FormattedMessage defaultMessage="Morpho Disabled" />
              </LabelValue>
            </Box>
            <Body>
              <FormattedMessage defaultMessage="You must approve Notional to manage your positions on Morpho." />
            </Body>
          </Box>
          <Button size="small">Enable</Button>
        </Box>
      </Container>
    </MuiModal>
  );
};

const Container = styled(Box)(
  ({ theme }) => `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: ${theme.palette.background.paper};
    padding: ${theme.spacing(3)};
    border-radius: ${theme.shape.borderRadius()};
    gap: ${theme.spacing(2)};
    width: ${theme.spacing(56)};
    display: flex;
    flex-direction: column;
    outline: none;
     &:focus: {
        outline: none;
    }
`
);
