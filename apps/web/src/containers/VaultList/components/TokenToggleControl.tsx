import { Box, useTheme } from '@mui/material';
import { TokenIcon } from '@notional-finance/icons';
import { Toggle } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';

interface TokenToggleControlProps {
  selectedTokenIndex: number;
  onChange: (index: number) => void;
}

export const TokenToggleControl = ({
  selectedTokenIndex,
  onChange,
}: TokenToggleControlProps) => {
  const theme = useTheme();

  return (
    <Toggle
      selectedTabIndex={selectedTokenIndex}
      onChange={(_, value) => onChange(Number(value))}
      tabLabels={[
        <FormattedMessage
          defaultMessage="All Tokens"
          description="Toggle label"
        />,
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing(1),
          }}
        >
          <TokenIcon symbol="usdc" size="small" />
          <FormattedMessage defaultMessage="USDC" description="Toggle label" />
        </Box>,
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing(1),
          }}
        >
          <TokenIcon symbol="weth" size="small" />
          <FormattedMessage defaultMessage="WETH" description="Toggle label" />
        </Box>,
      ]}
    />
  );
};
