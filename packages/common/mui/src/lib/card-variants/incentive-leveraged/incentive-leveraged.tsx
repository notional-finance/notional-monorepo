import { useState, ReactNode } from 'react';
import { useTheme, styled, Box } from '@mui/material';
import {
  TokenIcon,
  LightningIcon,
  DoubleTokenIcon,
} from '@notional-finance/icons';
import { Button } from '../../button/button';
import { Card } from '../../card/card';
import { Link } from 'react-router-dom';
import {
  H4,
  // Label,
  // LargeInputTextEmphasized,
  CurrencyTitle,
  CardInput,
  SectionTitle,
} from '../../typography/typography';
import { PlusIcon } from '@notional-finance/icons';
import { FormattedMessage } from 'react-intl';
import { StyledIcon } from '../currency-fixed/currency-fixed';
import { NotionalTheme, colors } from '@notional-finance/styles';
import { useIncentiveData } from '../use-incentive-data';

export interface IncentiveLeveragedProps {
  symbol: string;
  rate: number;
  incentiveData?: {
    symbol: string;
    incentiveAPY: number;
  };
  secondaryIncentiveData?: {
    symbol: string;
    incentiveAPY: number;
  };
  route: string;
  buttonText: ReactNode;
  customRate?: number;
}

interface ContentWrapperProps {
  hovered: boolean;
  theme: NotionalTheme;
}
interface CardValueProps {
  title: ReactNode;
  rate: string;
  symbol: string;
  incentiveData?: {
    symbol: string;
    incentiveAPY: number;
  };
  secondaryIncentiveData?: {
    symbol: string;
    incentiveAPY: number;
  };
  isIncentive?: boolean;
}

export const CardValue = ({
  title,
  rate,
  symbol,
  incentiveData,
  secondaryIncentiveData,
  isIncentive = false,
}: CardValueProps) => {
  const theme = useTheme();
  return (
    <Box>
      <SectionTitle textAlign="left" marginBottom={theme.spacing(1)}>
        {isIncentive && <PlusIcon width={'9px'} />}
        {title}
      </SectionTitle>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: theme.spacing(2),
        }}
      >
        {incentiveData && secondaryIncentiveData ? (
          <DoubleTokenIcon
            size="medium"
            symbolTop={incentiveData?.symbol}
            symbolBottom={secondaryIncentiveData?.symbol}
          />
        ) : (
          <TokenIcon symbol={incentiveData?.symbol || symbol} size="medium" />
        )}
        <CardInput
          textAlign="left"
          sx={{
            marginLeft: theme.spacing(0.5),
            color: rate.includes('-') ? colors.red : '',
          }}
        >
          {rate}
        </CardInput>
      </Box>
    </Box>
  );
};

export const IncentiveLeveraged = ({
  symbol,
  rate,
  incentiveData,
  secondaryIncentiveData,
  customRate = 0,
  route,
  buttonText,
}: IncentiveLeveragedProps) => {
  const theme = useTheme();
  const [hovered, setHovered] = useState(false);
  const {
    formattedTotalRate,
    secondaryIncentiveRate,
    formattedRate,
    incentiveApy,
    secondaryIncentiveApy,
    formattedCustomRate,
  } = useIncentiveData(rate, customRate, incentiveData, secondaryIncentiveData);

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
            marginBottom={theme.spacing(4)}
          >
            {symbol}
          </CurrencyTitle>
          <Box>
            <SectionTitle textAlign="left" marginBottom={theme.spacing(1)}>
              <FormattedMessage defaultMessage="Default Terms" />
            </SectionTitle>
            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <LightningIcon
                sx={{ height: '1.5em', marginRight: theme.spacing(1) }}
              />
              <H4
                textAlign="left"
                sx={{
                  color: formattedTotalRate.includes('-') ? colors.red : '',
                }}
              >
                {formattedTotalRate}
              </H4>
            </Box>
          </Box>
          <ContentWrapper hovered={hovered} theme={theme}>
            <Box>
              <CardValue
                title={<FormattedMessage defaultMessage={'ORGANIC'} />}
                rate={formattedRate}
                symbol={symbol}
              />
              {incentiveData && (
                <CardValue
                  title={
                    <FormattedMessage
                      defaultMessage="{symbol} INCENTIVE"
                      values={{
                        symbol: incentiveData.symbol,
                      }}
                    />
                  }
                  rate={incentiveApy}
                  symbol={incentiveData.symbol}
                  isIncentive
                />
              )}
              {secondaryIncentiveData && secondaryIncentiveRate > 0 && (
                <CardValue
                  title={
                    <FormattedMessage
                      defaultMessage="{symbol} INCENTIVE"
                      values={{
                        symbol: secondaryIncentiveData.symbol,
                      }}
                    />
                  }
                  rate={secondaryIncentiveApy}
                  symbol={secondaryIncentiveData.symbol}
                  isIncentive
                />
              )}
            </Box>
            <Box sx={{ minWidth: theme.spacing(27) }}>
              <Box sx={{ marginBottom: theme.spacing(6.5) }}>
                <SectionTitle textAlign="left" marginBottom={theme.spacing(1)}>
                  <FormattedMessage defaultMessage="Default Terms" />
                </SectionTitle>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <LightningIcon
                    sx={{ height: '1.5em', marginRight: theme.spacing(1) }}
                  />
                  <H4
                    textAlign="left"
                    sx={{
                      color: formattedTotalRate.includes('-') ? colors.red : '',
                    }}
                  >
                    {formattedTotalRate}
                  </H4>
                </Box>
              </Box>
              <SectionTitle textAlign="left" marginBottom={theme.spacing(1)}>
                <FormattedMessage defaultMessage="Custom Terms" />
              </SectionTitle>
              <Box
                marginBottom={theme.spacing(4)}
                sx={{
                  color: formattedCustomRate.includes('-')
                    ? colors.red
                    : theme.palette.typography.main,
                  display: 'flex',
                  alignItems: 'baseline',
                }}
              >
                <Label
                  sx={{
                    fontWeight: theme.typography.fontWeightRegular,
                    marginRight: theme.spacing(1),
                    color: theme.palette.typography.main,
                  }}
                >
                  <FormattedMessage defaultMessage="Up to " />
                </Label>
                <LargeInputTextEmphasized>
                  {formattedCustomRate}
                </LargeInputTextEmphasized>
              </Box>
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

export const ContentWrapper = styled(Box, {
  shouldForwardProp: (prop: string) => prop !== 'hovered',
})(
  ({ hovered, theme }: ContentWrapperProps) => `
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  width: ${theme.spacing(64)};
  min-height: ${theme.spacing(13.5)};
  margin-bottom: ${theme.spacing(2)};
  margin-top: ${theme.spacing(3)};
  margin-right: ${theme.spacing(4)};
  transition: 0.3s ease;
  transform: ${hovered ? 'translateX(0)' : 'translateX(-57%)'};
`
);

export default IncentiveLeveraged;
