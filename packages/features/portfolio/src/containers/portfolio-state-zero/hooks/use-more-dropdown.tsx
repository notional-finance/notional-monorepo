import { FormattedMessage } from 'react-intl';
import { SimpleOptionProps } from '@notional-finance/mui';
import { Box, useTheme } from '@mui/material';
import { TokenIcon } from '@notional-finance/icons';
import { Dispatch, SetStateAction } from 'react';
import { useAppStore } from '@notional-finance/notionable-hooks';

export const useMoreDropdown = (
  availableSymbols: string[],
  setActiveToken: Dispatch<SetStateAction<string>>
) => {
  const theme = useTheme();
  const { isMobileView } = useAppStore();
  let optionSymbols: any = [];
  if (availableSymbols.length > 8 && !isMobileView) {
    optionSymbols = availableSymbols.slice(8, availableSymbols.length);
  } else {
    optionSymbols = availableSymbols;
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
      symbol: symbol,
    };
  });

  return {
    options: options,
    title: <FormattedMessage defaultMessage={'More'} />,
    displaySymbols: isMobileView
      ? availableSymbols.slice(0, 2)
      : availableSymbols.slice(0, 8),
  };
};
