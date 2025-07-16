import {
  Backdrop,
  useTheme,
  Modal as MuiModal,
  alpha,
  styled,
  Box,
} from '@mui/material';
import { CloseX } from '@notional-finance/icons';
import { Body, LargeInputTextEmphasized } from '@notional-finance/mui';
import React from 'react';

export const TransactionModal = ({
  isOpen = false,
  topIcon,
  title,
  description,
  onDismiss,
  children,
}: {
  isOpen: boolean;
  topIcon: React.ReactNode;
  onDismiss: () => void;
  children: React.ReactNode | React.ReactNode[];
  title: React.ReactNode;
  description: React.ReactNode;
}) => {
  const theme = useTheme();
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
            stroke={theme.palette.text.primary}
            onClick={onDismiss}
          />
        </Box>
        <LargeInputTextEmphasized> {title}</LargeInputTextEmphasized>
        <Body>{description}</Body>
        {children}
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
