import React from 'react';
import { Box, Divider, styled, useTheme } from '@mui/material';
import { Drawer } from '../drawer/drawer';
import { ActionSidebarButtons } from '../action-sidebar-buttons/action-sidebar-buttons';
import { FormattedMessage, MessageDescriptor } from 'react-intl';
import ToggleSwitch, {
  ToggleSwitchProps,
} from '../toggle-switch/toggle-switch';
import {
  LargeInputTextEmphasized,
  HeadingSubtitle,
} from '../typography/typography';

export interface ActionSidebarProps {
  heading: MessageDescriptor;
  helptext: MessageDescriptor;
  children: React.ReactNode | React.ReactNode[];
  showDrawer?: boolean;
  canSubmit?: boolean;
  cancelRoute?: string;
  CustomActionButton?: React.ReactNode;
  showActionButtons?: boolean;
  advancedToggle?: ToggleSwitchProps;
}

const FormSection = styled(Box)`
  > *:not(:last-child) {
    margin-bottom: 48px;
    width: 100%;
  }
  > *:last-child {
    width: 100%;
  }
`;

// NOTE:
// - > *:not(:last-child) styles all of the children but the last one
// - > *  styles the last child element

export const ActionSidebar = ({
  heading,
  helptext,
  children,
  showDrawer = true,
  canSubmit,
  cancelRoute,
  CustomActionButton,
  advancedToggle,
  showActionButtons = true,
}: ActionSidebarProps) => {
  const theme = useTheme();
  const inner = (
    <>
      <Box
        sx={{
          display: {
            xs: 'none',
            sm: 'none',
            md: 'block',
            lg: 'block',
            xl: 'block',
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <LargeInputTextEmphasized gutter="default">
            <FormattedMessage {...heading} />
          </LargeInputTextEmphasized>
          {advancedToggle && (
            <Box
              sx={{
                display: 'inline',
                position: 'relative',
                top: theme.spacing(-11),
              }}
            >
              <ToggleSwitch {...advancedToggle} />
            </Box>
          )}
        </Box>
        <HeadingSubtitle
          marginBottom={theme.spacing(3)}
          sx={{ color: theme.palette.typography.light }}
        >
          <FormattedMessage {...helptext} />
        </HeadingSubtitle>
        <Divider
          sx={{
            marginBottom: theme.spacing(6),
            background: theme.palette.borders.paper,
          }}
          variant="fullWidth"
        />
      </Box>

      <FormSection>
        {children}
        {showActionButtons && (
          <ActionSidebarButtons
            canSubmit={canSubmit}
            cancelRoute={cancelRoute}
            CustomActionButton={CustomActionButton}
            sticky
          />
        )}
      </FormSection>
    </>
  );

  return showDrawer ? <Drawer size="large">{inner}</Drawer> : inner;
};
