import { ReactNode } from 'react';
import { Box, styled, useTheme } from '@mui/material';
import { AlertIcon } from '@notional-finance/icons';
import { LabelValue, Caption } from '../typography/typography';
import { NotionalTheme } from '@notional-finance/styles';
import { FormattedMessage } from 'react-intl';

interface ErrorMessageProps {
  variant: 'error' | 'warning';
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
  const defaultTitle =
    variant === 'error' ? (
      <FormattedMessage defaultMessage={'Error'} />
    ) : (
      <FormattedMessage defaultMessage={'Warning'} />
    );

  return message ? (
    <ErrorContainer variant={variant} theme={theme}>
      <AlertIcon
        sx={{
          fill:
            variant === 'error'
              ? theme.palette.error.main
              : theme.palette.warning.main,
        }}
      />
      <ErrorContent>
        <LabelValue>{title || defaultTitle}</LabelValue>
        <Caption
          sx={{
            maxWidth: theme.spacing(46),
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
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
  shouldForwardProp: (prop: string) => prop !== 'variant',
})(
  ({ variant, theme }: ErrorContainerProps) => `
    display: flex;
    align-items: center;
    width: 100%;
    height: 100%;
    border-radius: ${theme.shape.borderRadius()};
    border: 1px solid ${
      variant === 'error'
        ? theme.palette.error.main
        : theme.palette.warning.main
    };
    margin-top: ${theme.spacing(3)};
    padding: ${theme.spacing(1, 1.5)};
    background: ${
      variant === 'error'
        ? theme.palette.error.light
        : theme.palette.warning.light
    };
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
