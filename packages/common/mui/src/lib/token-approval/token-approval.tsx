import { Box, CircularProgress, useTheme } from '@mui/material';
import { TokenIcon } from '@notional-finance/icons';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import Switch from '../switch/switch';
import CheckCircle from '@mui/icons-material/CheckCircle';
import { Label, LabelValue } from '../typography/typography';

/* eslint-disable-next-line */
export interface TokenApprovalProps {
  symbol: string;
  success?: boolean;
  error?: boolean;
  approved?: boolean;
  approvalPending?: boolean;
  sx?: Record<string, string>;
  onChange: ({ symbol, approved }: { symbol: string; approved: boolean }) => void;
}

export function TokenApproval({
  symbol,
  onChange,
  success = false,
  error = false,
  approved = false,
  approvalPending = false,
  sx = {},
}: TokenApprovalProps) {
  const theme = useTheme();
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (success) {
      setPending(false);
    }
  }, [success]);

  useEffect(() => {
    setPending(approvalPending);
  }, [approvalPending]);

  useEffect(() => {
    if (error) {
      setPending(false);
    }
  }, [error]);

  const handleChange = ({ target: { checked } }: React.ChangeEvent<HTMLInputElement>) => {
    setPending(true);
    onChange({ symbol: symbol, approved: checked });
  };

  return (
    <Box
      sx={{
        ...sx,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.palette.background.default,
        paddingTop: '1rem',
        paddingLeft: '1rem',
        paddingRight: '1rem',
        border: theme.shape.borderStandard,
        borderRadius: theme.shape.borderRadius(),
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <TokenIcon symbol={symbol} size="medium" />
        {!pending && !success && (
          <Switch
            checked={approved}
            onChange={handleChange}
            sx={{
              margin: '0 .5rem',
            }}
          />
        )}
        {pending && (
          <CircularProgress
            size={24}
            color="primary"
            sx={{
              margin: '0 1rem',
            }}
          />
        )}
        {!pending && success && (
          <CheckCircle
            color="primary"
            sx={{
              margin: '0 1rem',
            }}
          />
        )}
        <LabelValue
          inline
          sx={{
            color: approved ? theme.palette.typography.main : theme.palette.typography.light,
          }}
        >
          {approved ? (
            <FormattedMessage defaultMessage="Enabled" />
          ) : (
            <FormattedMessage defaultMessage="Disable" />
          )}
        </LabelValue>
      </Box>
      <Label
        sx={{
          padding: theme.spacing(2, 0),
          color: approved ? theme.palette.typography.main : theme.palette.typography.light,
        }}
      >
        <FormattedMessage
          defaultMessage="Enabling a currency is required for Notional to access funds in your wallet."
          description="enable currency instructions"
        />
      </Label>
    </Box>
  );
}

export default TokenApproval;
