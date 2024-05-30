import React from 'react';
import { Box, Divider, styled, useTheme } from '@mui/material';
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
  heading:
    | MessageDescriptor
    | { defaultMessage: string }
    | { values?: Record<string, unknown> };
  walletConnectedText?: MessageDescriptor;
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
  hideActionButtons?: boolean;
  hideTextOnMobile?: boolean;
  advancedToggle?: ToggleSwitchProps;
  NetworkSelector?: React.ReactNode;
  leverageDisabled?: boolean;
  isPortfolio?: boolean;
  handleSubmit?: () => void;
  mobileTopMargin?: string;
}
export interface ActionSideBarContainerProps {
  hideTextOnMobile: boolean;
  isPortfolio?: boolean;
  theme: NotionalTheme;
}
interface ContainerProps {
  isPortfolio?: boolean;
  mobileTopMargin?: string;
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
  NetworkSelector,
  advancedToggle,
  hideActionButtons,
  hideTextOnMobile = true,
  handleSubmit,
  isPortfolio,
  leverageDisabled,
  mobileTopMargin,
  walletConnectedText,
}: ActionSidebarProps) => {
  const theme = useTheme();

  return (
    <Container
      isPortfolio={isPortfolio}
      mobileTopMargin={mobileTopMargin}
      theme={theme}
    >
      <ActionSideBarContainer hideTextOnMobile={hideTextOnMobile} theme={theme}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignContent: 'center',
              width: '100%',
            }}
          >
            <LargeInputTextEmphasized
              gutter="default"
              sx={{
                display: { xs: 'none', sm: 'none', md: 'block' },
              }}
            >
              <FormattedMessage {...heading} />
            </LargeInputTextEmphasized>
            {NetworkSelector}
          </Box>
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
        {!hideActionButtons && !CustomActionButton && handleSubmit && (
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
            walletConnectedText={walletConnectedText}
            leverageDisabled={leverageDisabled}
          />
        )}
      </FormSection>
    </Container>
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
const Container = styled(Box, {
  shouldForwardProp: (prop: string) =>
    prop !== 'hideTextOnMobile' &&
    prop !== 'mobileTopMargin' &&
    prop !== 'isPortfolio',
})(
  ({ isPortfolio, theme, mobileTopMargin }: ContainerProps) => `
  ${theme.breakpoints.down('sm')} {
    margin: auto;
    width: ${isPortfolio ? '90%' : '100%'};
    margin-top: ${
      isPortfolio ? '0px' : mobileTopMargin ? mobileTopMargin : theme.spacing(5)
    };
    padding-bottom: ${theme.spacing(10)};
  }
  
  `
);

export default ActionSidebar;
