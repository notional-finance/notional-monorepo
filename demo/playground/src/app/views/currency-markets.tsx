import { Box, Card, Typography } from '@mui/material';
import { useAllMarkets } from '@notional-finance/notionable';
import { TokenIcon } from '../components/token-icon';
import { Date } from '../components/date';

export const CurrencyMarkets = () => {
  const { currencyMarkets } = useAllMarkets();
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        paddingTop: 1,
        m: 1,
        maxWidth: 600,
      }}
    >
      <Typography variant="h5" component="h3" sx={{ marginBottom: 1 }}>
        All Markets
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        {[...currencyMarkets.entries()].map(([key, market]) => (
          <Card
            key={key}
            sx={{
              display: 'flex',
              width: 100,
              p: 1,
              mb: 1,
              justifyContent: 'space-between',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignContent: 'center',
              }}
              key={key}
            >
              <Box sx={{ display: 'flex', alignContent: 'center' }}>
                <TokenIcon symbol={market.underlyingSymbol} width="24" />
                <Typography variant="caption" sx={{ ml: 1 }}>
                  {market.underlyingSymbol}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', ml: 1 }}>
                {[...market.markets.entries()].map(([marketKey, m]) => (
                  <Typography variant="h6" component="div" key={marketKey}>
                    <Date timestampInSeconds={m.maturity} />
                  </Typography>
                ))}
              </Box>
            </Box>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

/*
<Card key={key} sx={{ p: 1, mb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignContent: 'center' }}>
            <Box sx={{ display: 'flex', alignContent: 'center' }}>
              <TokenIcon symbol={markets[key].underlyingSymbol} width="24" />
              <Typography variant="caption" sx={{ ml: 1 }}>
                {key}
              </Typography>
            </Box>
            <Box>{tokens[key].balance.toDisplayString()}</Box>
          </Box>
        </Card>
*/
