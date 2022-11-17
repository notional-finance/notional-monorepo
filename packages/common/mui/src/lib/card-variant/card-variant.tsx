import { styled, Box } from '@mui/material';
import { TokenIcon } from '@notional-finance/icons';
import { Button } from '../button/button';
import { Card } from '../card/card';
import { Link } from 'react-router-dom';
import { CurrencyVariant, CurrencyVariantProps } from './variants/currency';
import { VaultVariant, VaultVariantProps } from './variants/vault';
import { IncentiveVariant, IncentiveVariantProps } from './variants/incentive';
import { useNotionalTheme } from '@notional-finance/styles';

interface CardVariantProps {
  variant: 'currency' | 'vault' | 'incentive';
  symbol?: string;
  route: string;
  buttonText: string;
}

type AllCardVariantProps = CardVariantProps &
  (VaultVariantProps | CurrencyVariantProps | IncentiveVariantProps);

const StyledIcon = styled(Box)(
  ({ theme }) => `
  position: relative;
  // card width is theme.spacing(38), this includes theme.spacing(3) of 
  // padding on both sides so we can space this at 38 - 6 - (72 / 8) (23)
  left: ${theme.spacing(23)};

  img {
    left: 0px;
    top: ${theme.spacing(-2)};
    position: absolute;
    z-index: 2;
  }

  &::after {
    position: absolute;
    content: '';
    top: ${theme.spacing(-3)};
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

export function CardVariant(props: AllCardVariantProps) {
  const theme = useNotionalTheme('light');
  const { variant, route, symbol, buttonText } = props;
  let height = '240px';
  if (
    variant === 'incentive' &&
    (props as IncentiveVariantProps).incentiveRate
  ) {
    height = '370px';
  } else if (variant === 'vault') {
    height = '440px';
  }

  return (
    <Link to={route}>
      <Card height={height}>
        {symbol && (
          <StyledIcon
            // margin-top on the card is theme.spacing(6) so we can "undo" that to
            // move the icon to the top of the card, and then we have it pop over
            // the top of the card with theme.spacing(3)
            top={variant === 'vault' ? theme.spacing(-3) : theme.spacing(-9)}
          >
            <TokenIcon symbol={symbol} size="extraLarge" />
          </StyledIcon>
        )}
        {variant === 'currency' && (
          <CurrencyVariant {...(props as CurrencyVariantProps)} />
        )}
        {variant === 'vault' && (
          <VaultVariant {...(props as VaultVariantProps)} />
        )}
        {variant === 'incentive' && (
          <IncentiveVariant {...(props as IncentiveVariantProps)} />
        )}
        <Button
          fullWidth
          size="medium"
          variant="contained"
          sx={{ background: theme.palette.primary.light }}
        >
          {buttonText}
        </Button>
      </Card>
    </Link>
  );
}
