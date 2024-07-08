import { FormattedMessage } from 'react-intl';
import { SimpleOptionProps } from '@notional-finance/mui';
import { Box, useTheme } from '@mui/material';
import { TokenIcon } from '@notional-finance/icons';
import { Dispatch, SetStateAction } from 'react';

export const useMoreDropdown = (
  availableSymbols: string[],
  setActiveToken: Dispatch<SetStateAction<string>>
) => {
  const theme = useTheme();
  let optionSymbols: any = [];
  if (availableSymbols.length > 8) {
    optionSymbols = availableSymbols.slice(8, availableSymbols.length);
  }

  const options: SimpleOptionProps[] = optionSymbols.map((symbol) => {
    return {
      label: (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TokenIcon
            symbol={symbol}
            size="small"
            style={{ marginRight: theme.spacing(1) }}
          />
          {symbol}
        </Box>
      ),
      callback: () => setActiveToken(symbol),
    };
  });

  return {
    options: options,
    title: <FormattedMessage defaultMessage={'More'} />,
    displaySymbols: availableSymbols.slice(0, 8),
  };
};
