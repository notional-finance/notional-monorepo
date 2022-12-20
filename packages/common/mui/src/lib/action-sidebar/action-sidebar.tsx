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
import { NotionalTheme } from '@notional-finance/styles';

export interface ActionSidebarProps {
  heading: MessageDescriptor;
  helptext: MessageDescriptor;
  children: React.ReactNode | React.ReactNode[];
  showDrawer?: boolean;
  canSubmit?: boolean;
  cancelRoute?: string;
  CustomActionButton?: React.ReactNode;
  showActionButtons?: boolean;
  hideTextOnMobile?: boolean;
  advancedToggle?: ToggleSwitchProps;
}
export interface ActionSideBarContainerProps {
  hideTextOnMobile: boolean;
  theme: NotionalTheme;
}

const FormSection = styled(Box, {
  shouldForwardProp: (prop: string) => prop !== 'hideTextOnMobile',
})(
  ({ hideTextOnMobile, theme }: ActionSideBarContainerProps) => `
  > *:not(:last-child) {
    margin-bottom: ${theme.spacing(6)};
    width: 100%;
  }
  > *:last-child {
    width: 100%;
  }
  ${theme.breakpoints.down('sm')} {
    margin-top: ${hideTextOnMobile ? theme.spacing(22) : '0px'};
  }
`
);

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
  hideTextOnMobile = false,
}: ActionSidebarProps) => {
  const theme = useTheme();
  const inner = (
    <>
      <ActionSideBarContainer hideTextOnMobile={hideTextOnMobile} theme={theme}>
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
      </ActionSideBarContainer>
      <FormSection hideTextOnMobile={hideTextOnMobile} theme={theme}>
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

const ActionSideBarContainer = styled(Box, {
  shouldForwardProp: (prop: string) => prop !== 'hideTextOnMobile',
})(
  ({ hideTextOnMobile, theme }: ActionSideBarContainerProps) => `
  ${theme.breakpoints.down('lg')} {
    display: ${hideTextOnMobile ? 'none' : 'block'};
  }
  
  `
);
