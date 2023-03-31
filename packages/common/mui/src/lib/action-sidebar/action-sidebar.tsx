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
  H4,
} from '../typography/typography';
import { NotionalTheme } from '@notional-finance/styles';

export interface ActionSidebarProps {
  heading: MessageDescriptor;
  helptext: MessageDescriptor;
  helpTextVaules?: string;
  children: React.ReactNode | React.ReactNode[];
  showDrawer?: boolean;
  canSubmit?: boolean;
  cancelRoute?: string;
  onCancelCallback?: () => void;
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
  onCancelCallback,
  CustomActionButton,
  advancedToggle,
  showActionButtons = true,
  hideTextOnMobile = true,
  helpTextVaules,
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
          <LargeInputTextEmphasized
            gutter="default"
            sx={{ display: { xs: 'none', sm: 'none', md: 'block' } }}
          >
            <FormattedMessage {...heading} />
          </LargeInputTextEmphasized>
          <H4
            gutter="default"
            sx={{
              display: { xs: 'block', sm: 'block', md: 'none' },
              textTransform: 'uppercase',
              marginBottom: theme.spacing(5),
            }}
          >
            <FormattedMessage {...heading} />
          </H4>
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
          sx={{
            color: theme.palette.typography.light,
            display: { xs: 'none', sm: 'none', md: 'block' },
          }}
        >
          <FormattedMessage
            {...helptext}
            values={{
              value: helpTextVaules ? helpTextVaules : '',
            }}
          />
        </HeadingSubtitle>
        <Divider
          sx={{
            marginBottom: theme.spacing(6),
            background: theme.palette.borders.paper,
            display: { xs: 'none', sm: 'none', md: 'block' },
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
            onCancelCallback={onCancelCallback}
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
  ${theme.breakpoints.down('sm')} {
    display: ${hideTextOnMobile ? 'none' : 'block'};
  }
  
  `
);

export default ActionSidebar;
