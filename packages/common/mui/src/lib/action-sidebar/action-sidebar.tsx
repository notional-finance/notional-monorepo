import React from 'react';
import { Box, Divider, styled, useTheme } from '@mui/material';
import { ActionSidebarButtons } from '../action-sidebar-buttons/action-sidebar-buttons';
import { FormattedMessage, MessageDescriptor } from 'react-intl';
import { LeverUpToggle } from '../lever-up-toggle/lever-up-toggle';
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
  heading:
    | MessageDescriptor
    | { defaultMessage: string }
    | { values?: Record<string, unknown> };
  helptext:
    | MessageDescriptor
    | { defaultMessage: string }
    | { values?: Record<string, unknown> }
    | undefined;
  children: React.ReactNode | React.ReactNode[];
  canSubmit?: boolean;
  cancelRoute?: string;
  onCancelCallback?: () => void;
  CustomActionButton?: React.ElementType;
  showActionButtons?: boolean;
  hideTextOnMobile?: boolean;
  advancedToggle?: ToggleSwitchProps;
  handleLeverUpToggle?: () => void;
  leverageDisabled?: boolean;
  leveredUp?: boolean;
  handleSubmit?: () => void;
  showLeverUpToggle?: boolean;
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
  canSubmit,
  cancelRoute,
  onCancelCallback,
  CustomActionButton,
  advancedToggle,
  showActionButtons = true,
  hideTextOnMobile = true,
  handleLeverUpToggle,
  leveredUp,
  showLeverUpToggle,
  handleSubmit,
  leverageDisabled,
}: ActionSidebarProps) => {
  const theme = useTheme();

  return (
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
          {showLeverUpToggle &&
            handleLeverUpToggle &&
            leveredUp !== undefined && (
              <LeverUpToggle
                leveredUp={leveredUp}
                altBackground={false}
                handleLeverUpToggle={handleLeverUpToggle}
              />
            )}
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
          <FormattedMessage {...helptext} />
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
        {showActionButtons && !CustomActionButton && handleSubmit && (
          <ActionSidebarButtons
            canSubmit={canSubmit}
            cancelRoute={cancelRoute}
            onCancelCallback={onCancelCallback}
            sticky
            onSubmit={handleSubmit}
          />
        )}
        {handleSubmit && CustomActionButton && (
          <CustomActionButton
            onSubmit={handleSubmit}
            canSubmit={canSubmit}
            leverageDisabled={leverageDisabled}
          />
        )}
      </FormSection>
    </>
  );
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
