import { useState, ReactNode } from 'react';
import { styled, Box, useTheme } from '@mui/material';
import { TokenIcon } from '@notional-finance/icons';
import { Button } from '../../button/button';
import { Card } from '../../card/card';
import { Link } from 'react-router-dom';
import {
  CurrencyTitle,
  H4,
  SectionTitle,
  CardInput,
  Subtitle,
} from '../../typography/typography';
import { FormattedMessage } from 'react-intl';
import { NotionalTheme, colors } from '@notional-finance/styles';

interface AllRates {
  rate: string;
  maturity: string;
}
export interface CurrencyFixedProps {
  rate: number;
  allRates: AllRates[];
  symbol?: string;
  route: string;
  buttonText: ReactNode;
  apyTagline: ReactNode;
}

export interface ContentWrapperProps {
  hovered: boolean;
  theme: NotionalTheme;
}

export const CurrencyFixed = (props: CurrencyFixedProps) => {
  const theme = useTheme();
  const { route, symbol, buttonText, rate, allRates, apyTagline } = props;
  const [hovered, setHovered] = useState(false);
  // NOTE: limits digits to 2 decimal places because of the longer APY suffix, higher
  // apy rates will get cut off.
  const formattedRate = `${rate.toPrecision(2)}%`;

  return (
    <Link to={route}>
      <Card
        height={'auto'}
        onMouseOver={() => setHovered(true)}
        onMouseOut={() => setHovered(false)}
      >
        {symbol && (
          <StyledIcon top={theme.spacing(-9)}>
            <TokenIcon symbol={symbol} size="extraLarge" />
          </StyledIcon>
        )}
        <Box sx={{ overflow: 'hidden' }}>
          <CurrencyTitle
            accent
            textAlign="left"
            marginBottom={theme.spacing(2)}
          >
            {symbol}
          </CurrencyTitle>
          <ContentWrapper hovered={hovered} theme={theme}>
            <Box>
              {allRates.map(({ rate, maturity }, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'baseline',
                    marginBottom: theme.spacing(1),
                  }}
                >
                  <CardInput>{rate}</CardInput>
                  <Subtitle sx={{ marginLeft: theme.spacing(1) }}>
                    {maturity}
                  </Subtitle>
                </Box>
              ))}
            </Box>
            <Box>
              <SectionTitle textAlign="left" marginBottom={theme.spacing(1)}>
                {apyTagline}
              </SectionTitle>
              <H4
                textAlign="left"
                fontWeight="bold"
                marginBottom={theme.spacing(4)}
              >
                <FormattedMessage
                  defaultMessage="{formattedRate} Fixed APY"
                  values={{
                    formattedRate: formattedRate,
                  }}
                />
              </H4>
            </Box>
          </ContentWrapper>
        </Box>
        <Button
          fullWidth
          size="large"
          variant="contained"
          sx={{
            textTransform: 'uppercase',
          }}
        >
          {buttonText}
        </Button>
      </Card>
    </Link>
  );
};

const ContentWrapper = styled(Box, {
  shouldForwardProp: (prop: string) => prop !== 'hovered',
})(
  ({ hovered, theme }: ContentWrapperProps) => `
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  width: 550px;
  min-height: 108px;
  margin-bottom: ${theme.spacing(2)};
  margin-right: ${theme.spacing(4)};
  transition: 0.3s ease;
  transform: ${hovered ? 'translateX(0)' : 'translateX(-57%)'};
`
);

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
    border: 10px solid ${colors.white};
    padding: 34px;
    box-shadow: ${theme.shape.shadowStandard};
    z-index: 1;
    width: 0;
    height: 0;
  }
`
);

export default CurrencyFixed;
