import { ReactNode } from 'react';
import { Box, SxProps, styled, useTheme } from '@mui/material';
import { AlertIcon } from '@notional-finance/icons';
import { LabelValue, Caption } from '../typography/typography';
import { NotionalTheme } from '@notional-finance/styles';
import { FormattedMessage } from 'react-intl';

interface ErrorMessageProps {
  variant: 'error' | 'warning' | 'info' | 'pending';
  title?: ReactNode;
  message?: ReactNode | string;
  marginBottom?: boolean;
  sx?: SxProps;
  maxWidth?: string;
  children?: ReactNode;
}

export interface ErrorContainerProps {
  variant: ErrorMessageProps['variant'];
  theme: NotionalTheme;
}

export const ErrorMessage = ({
  variant,
  title,
  message,
  marginBottom,
  children,
  maxWidth,
  sx,
}: ErrorMessageProps) => {
  const theme = useTheme();
  let defaultTitle: React.ReactNode;
  switch (variant) {
    case 'error':
      defaultTitle = <FormattedMessage defaultMessage={'Error'} />;
      break;
    case 'warning':
      defaultTitle = <FormattedMessage defaultMessage={'Warning'} />;
      break;
    case 'info':
      defaultTitle = <FormattedMessage defaultMessage={'Info'} />;
      break;
    case 'pending':
      defaultTitle = <FormattedMessage defaultMessage={'Pending'} />;
      break;
  }

  return message ? (
    <ErrorContainer
      variant={variant}
      theme={theme}
      sx={{
        marginTop: marginBottom ? undefined : theme.spacing(3),
        marginBottom: marginBottom ? theme.spacing(3) : undefined,
        ...sx,
      }}
    >
      <AlertIcon sx={{ fill: theme.palette[variant].dark }} />
      <ErrorContent>
        <LabelValue>{title || defaultTitle}</LabelValue>
        <Caption
          sx={{
            whiteSpace: 'pre-line',
            maxWidth: maxWidth ? maxWidth : theme.spacing(46),
            overflow: 'hidden',
          }}
        >
          {message}
        </Caption>
      </ErrorContent>
      {children}
    </ErrorContainer>
  ) : (
    <span></span>
  );
};

export default ErrorMessage;

const ErrorContainer = styled(Box, {
  shouldForwardProp: (prop: string) => prop !== 'variant',
})(
  ({ variant, theme }: ErrorContainerProps) => `
    display: flex;
    align-items: center;
    width: 100%;
    height: 100%;
    border-radius: ${theme.shape.borderRadius()};
    border: 1px solid ${theme.palette[variant].main};
    padding: ${theme.spacing(1, 1.5)};
    background: ${theme.palette[variant].light};
  `
);
const ErrorContent = styled(Box)(
  ({ theme }) => `
    display: flex;
    align-items: flex-start;
    flex-direction: column;
    width: 100%;
    height: 100%;
    margin-left: ${theme.spacing(1.5)}
  `
);
