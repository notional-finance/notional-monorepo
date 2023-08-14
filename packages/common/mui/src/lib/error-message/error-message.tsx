import { ReactNode } from 'react';
import { Box, styled, useTheme } from '@mui/material';
import { AlertIcon } from '@notional-finance/icons';
import { LabelValue, Caption } from '../typography/typography';
import { NotionalTheme } from '@notional-finance/styles';
import { FormattedMessage } from 'react-intl';

interface ErrorMessageProps {
  variant: 'error' | 'warning' | 'info';
  title?: ReactNode;
  message?: ReactNode;
}

export interface ErrorContainerProps {
  variant: ErrorMessageProps['variant'];
  theme: NotionalTheme;
}

export const ErrorMessage = ({
  variant,
  title,
  message,
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
  }

  return message ? (
    <ErrorContainer variant={variant} theme={theme}>
      <AlertIcon sx={{ fill: theme.palette[variant].dark }} />
      <ErrorContent>
        <LabelValue>{title || defaultTitle}</LabelValue>
        <Caption
          sx={{
            maxWidth: theme.spacing(46),
            overflow: 'hidden',
          }}
        >
          {message}
        </Caption>
      </ErrorContent>
    </ErrorContainer>
  ) : (
    <span></span>
  );
};

export default ErrorMessage;

const ErrorContainer = styled(Box, {
  shouldForwardProp: (prop: string) => prop !== 'variantColor',
})(
  ({ variant, theme }: ErrorContainerProps) => `
    display: flex;
    align-items: center;
    width: 100%;
    height: 100%;
    border-radius: ${theme.shape.borderRadius()};
    border: 1px solid ${theme.palette[variant].main};
    margin-top: ${theme.spacing(3)};
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
