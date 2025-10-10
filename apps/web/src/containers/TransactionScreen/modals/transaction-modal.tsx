import {
  Backdrop,
  useTheme,
  Modal as MuiModal,
  alpha,
  styled,
  Box,
} from '@mui/material';
import {
  CheckmarkIcon,
  CloseX,
  DiscordIcon,
  InfoIcon,
} from '@notional-finance/icons';
import {
  Body,
  Button,
  LargeInputTextEmphasized,
  ProgressIndicator,
} from '@notional-finance/mui';
import { TransactionStatus } from '@notional-finance/util';
import React from 'react';
import { FormattedMessage } from 'react-intl';

const DiscordButton = () => {
  return (
    <Button
      startIcon={<DiscordIcon />}
      variant="outlined"
      size="large"
      href={'https://discord.notional.finance'}
      sx={{ width: '100%' }}
    >
      <FormattedMessage defaultMessage={'Get Help in Discord'} />
    </Button>
  );
};

export const TransactionModal = ({
  isOpen = false,
  transactionStatus,
  title,
  description,
  onDismiss,
  children,
}: {
  isOpen: boolean;
  transactionStatus: TransactionStatus;
  onDismiss: () => void;
  children: React.ReactNode | React.ReactNode[];
  title?: React.ReactNode;
  description: React.ReactNode;
}) => {
  const theme = useTheme();
  let topIcon: React.ReactNode;
  let isError = false;

  if (
    transactionStatus === TransactionStatus.NONE ||
    transactionStatus === TransactionStatus.REJECTED
  ) {
    // Pending Approval
    topIcon = (
      <InfoIcon
        sx={{ fontSize: theme.spacing(5) }}
        fill={theme.palette.warning.main}
      />
    );
    // Title should be passed in in this case
  } else if (
    transactionStatus === TransactionStatus.ERROR_BUILDING ||
    transactionStatus === TransactionStatus.REVERT
  ) {
    isError = true;
    // Error
    topIcon = (
      <InfoIcon
        sx={{ fontSize: theme.spacing(5) }}
        fill={theme.palette.error.main}
      />
    );
    title = <FormattedMessage defaultMessage="Transaction Failed" />;
  } else if (
    transactionStatus === TransactionStatus.WAIT_USER_CONFIRM ||
    transactionStatus === TransactionStatus.SUBMITTED ||
    transactionStatus === TransactionStatus.BUILDING ||
    // TODO: does this work with approvals?
    transactionStatus === TransactionStatus.BUILT
  ) {
    // Pending
    topIcon = (
      <Box>
        <ProgressIndicator type="notional" width="75" />
      </Box>
    );
    title = <FormattedMessage defaultMessage="Transaction Pending" />;
  } else {
    // Success
    topIcon = (
      <CheckmarkIcon
        sx={{ fontSize: theme.spacing(5) }}
        fill={theme.palette.success.main}
      />
    );
    title = (
      <FormattedMessage
        defaultMessage="<a1>Success!</a1> Transaction is confirmed."
        values={{
          a1: (msg: React.ReactNode) => (
            <Box component="span" sx={{ color: theme.palette.success.main }}>
              {msg}
            </Box>
          ),
        }}
      />
    );
  }

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
          {topIcon}
          <CloseX
            sx={{ fontSize: theme.spacing(2), cursor: 'pointer' }}
            stroke={theme.palette.typography.main}
            onClick={onDismiss}
          />
        </Box>
        <LargeInputTextEmphasized> {title}</LargeInputTextEmphasized>
        <Body sx={{ overflowWrap: 'break-word' }}>{description}</Body>
        {children}
        {isError && <DiscordButton />}
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
