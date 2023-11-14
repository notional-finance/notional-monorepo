import { Box, CircularProgress, useTheme, alpha } from '@mui/material';
import { TokenIcon } from '@notional-finance/icons';
import { FormattedMessage } from 'react-intl';
import { Button, Label, LabelValue } from '@notional-finance/mui';
import { MessageDescriptor } from 'react-intl';

export interface ApprovalButtonProps {
  symbol: string;
  sx?: Record<string, string>;
  showSymbol?: boolean;
  callback: () => void;
  description: MessageDescriptor;
  title: MessageDescriptor;
  buttonText: MessageDescriptor;
  pending: boolean;
  depositAmount?: string;
}

export const ApprovalButton = ({
  symbol,
  callback,
  description,
  title,
  buttonText,
  pending,
  showSymbol = true,
  sx = {},
  depositAmount,
}: ApprovalButtonProps) => {
  const theme = useTheme();

  return (
    <Box
      onClick={() => callback()}
      sx={{
        display: 'flex',
        backgroundColor: theme.palette.background.paper,
        padding: theme.spacing(2),
        border: theme.shape.borderStandard,
        borderRadius: theme.shape.borderRadius(),
        borderLeft: `5px solid ${theme.palette.warning.main}`,
        marginBottom: theme.spacing(2),
        marginTop: theme.spacing(2),
        cursor: 'pointer',
        '&:hover': {
          button: {
            border: `1px solid ${theme.palette.warning.main}`,
            background: `${alpha(theme.palette.warning.main, 0.1)}`,
          },
        },
        ...sx,
      }}
    >
      <Box
        sx={{
          display: 'block',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {showSymbol && (
            <>
              <TokenIcon symbol={symbol} size="medium" />
              <LabelValue
                inline
                sx={{
                  marginRight: theme.spacing(0.5),
                  marginLeft: theme.spacing(1),
                  color: theme.palette.typography.main,
                  textTransform: 'uppercase',
                }}
              >
                {symbol}
              </LabelValue>
            </>
          )}
          <LabelValue
            inline
            msg={title}
            sx={{
              color: theme.palette.typography.main,
            }}
          />
        </Box>
        <Label
          sx={{
            padding: theme.spacing(2, 0),
            color: theme.palette.typography.light,
          }}
        >
          <FormattedMessage
            {...description}
            values={{
              depositAmount,
            }}
          />
        </Label>
      </Box>
      <Box
        sx={{
          alignItems: 'center',
          display: 'flex',
          minWidth: theme.spacing(10.5),
        }}
      >
        {pending ? (
          <CircularProgress
            size={24}
            color="primary"
            sx={{
              margin: theme.spacing(0, 1),
              color: theme.palette.warning.main,
            }}
          />
        ) : (
          <Button
            variant="outlined"
            sx={{
              color: theme.palette.warning.main,
              border: `1px solid ${theme.palette.warning.main}`,
            }}
          >
            {buttonText ? (
              <FormattedMessage {...buttonText} />
            ) : (
              <FormattedMessage defaultMessage={'Enable'} />
            )}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default ApprovalButton;
