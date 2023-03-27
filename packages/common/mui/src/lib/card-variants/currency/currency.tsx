import { ReactNode } from 'react';
import { styled, Box } from '@mui/material';
import { TokenIcon } from '@notional-finance/icons';
import { Button } from '../../button/button';
import { Card } from '../../card/card';
import { Link } from 'react-router-dom';
import { H4, CurrencyTitle, SectionTitle } from '../../typography/typography';
import { Market } from '@notional-finance/sdk/src/system';
import { FormattedMessage } from 'react-intl';
import { useNotionalTheme } from '@notional-finance/styles';

export interface CurrencyProps {
  rate: number;
  symbol?: string;
  route: string;
  buttonText: ReactNode;
  // TODO: add maturity and rates data structure
}

export const Currency = (props: CurrencyProps) => {
  const theme = useNotionalTheme('light');
  const { route, symbol, buttonText, rate } = props;
  const formattedRate = Market.formatInterestRate(rate, 2);

  return (
    <Link to={route}>
      <Card height={'auto'}>
        {symbol && (
          <StyledIcon top={theme.spacing(-9)}>
            <TokenIcon symbol={symbol} size="extraLarge" />
          </StyledIcon>
        )}
        <>
          <CurrencyTitle
            accent
            textAlign="left"
            marginBottom={theme.spacing(4)}
          >
            {symbol}
          </CurrencyTitle>
          <SectionTitle textAlign="left">
            <FormattedMessage defaultMessage={'VARIABLE RATE'} />
          </SectionTitle>
          <H4 textAlign="left" marginBottom={theme.spacing(4)}>
            <FormattedMessage
              defaultMessage="{formattedRate} APY"
              values={{
                formattedRate: formattedRate,
              }}
            />
          </H4>
        </>
        <Button
          fullWidth
          size="large"
          variant="contained"
          sx={{
            background: theme.palette.primary.light,
            textTransform: 'uppercase',
          }}
        >
          {buttonText}
        </Button>
      </Card>
    </Link>
  );
};

const StyledIcon = styled(Box)(
  ({ theme }) => `
  position: relative;
  left: ${theme.spacing(23)};

  img {
    left: 0px;
    top: ${theme.spacing(3)};
    position: absolute;
    z-index: 2;
  }

  &::after {
    position: absolute;
    content: '';
    top: ${theme.spacing(2)};
    right: 0px;
    bottom: 0px;
    left: ${theme.spacing(-1)};
    border-radius: 50%;
    border: 10px solid ${theme.palette.common.white};
    padding: 34px;
    background: ${theme.palette.common.white};
    box-shadow: 1px 2px 3px 0px #14296633;
    z-index: 1;
    width: 0;
    height: 0;
  }
`
);
export default Currency;
