import { useState, ReactNode } from 'react';
import { useTheme, styled, Box } from '@mui/material';
import { TokenIcon, LightningIcon } from '@notional-finance/icons';
import { Button } from '../../button/button';
import { Card } from '../../card/card';
import { Link } from 'react-router-dom';
import {
  H4,
  Label,
  LargeInputTextEmphasized,
  CurrencyTitle,
  CardInput,
  SectionTitle,
} from '../../typography/typography';
import { PlusIcon } from '@notional-finance/icons';
import { FormattedMessage } from 'react-intl';
import { StyledIcon } from '../currency-fixed/currency-fixed';
import { formatNumberAsAPY } from '@notional-finance/helpers';
import { NotionalTheme, colors } from '@notional-finance/styles';

export interface IncentiveLeveragedProps {
  symbol: string;
  rate: number;
  incentiveRate: number;
  route: string;
  buttonText: ReactNode;
  customRate?: number;
}

interface ContentWrapperProps {
  hovered: boolean;
  theme: NotionalTheme;
}

export const IncentiveLeveraged = ({
  symbol,
  rate,
  incentiveRate,
  customRate = 0,
  route,
  buttonText,
}: IncentiveLeveragedProps) => {
  const theme = useTheme();
  const [hovered, setHovered] = useState(false);
  const formattedTotalRate = formatNumberAsAPY(rate);
  const formattedRate = formatNumberAsAPY(rate - incentiveRate);
  const formattedIncentiveRate = formatNumberAsAPY(incentiveRate);
  const formattedCustomRate = formatNumberAsAPY(customRate);

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
            marginBottom={theme.spacing(1)}
          >
            {symbol}
          </CurrencyTitle>
          <ContentWrapper hovered={hovered} theme={theme}>
            <Box>
              <SectionTitle textAlign="left" marginBottom={theme.spacing(1)}>
                <FormattedMessage defaultMessage={'ORGANIC'} />
              </SectionTitle>
              <CardInput
                textAlign="left"
                marginBottom={theme.spacing(3)}
                sx={{ color: formattedRate.includes('-') ? colors.red : '' }}
              >
                {formattedRate}
              </CardInput>
              <SectionTitle textAlign="left" marginBottom={theme.spacing(1)}>
                <PlusIcon width={'9px'} />
                <FormattedMessage defaultMessage="NOTE INCENTIVE" />
              </SectionTitle>
              <CardInput
                textAlign="left"
                marginBottom={theme.spacing(3)}
                sx={{
                  color: formattedIncentiveRate.includes('-') ? colors.red : '',
                }}
              >
                {formattedIncentiveRate}
              </CardInput>
            </Box>
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
                  marginBottom={theme.spacing(4)}
                  sx={{
                    color: formattedTotalRate.includes('-') ? colors.red : '',
                  }}
                >
                  {formattedTotalRate}
                </H4>
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
                  <FormattedMessage defaultMessage="Up To " />
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

const ContentWrapper = styled(Box, {
  shouldForwardProp: (prop: string) => prop !== 'hovered',
})(
  ({ hovered, theme }: ContentWrapperProps) => `
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  width: ${theme.spacing(59.25)};
  min-height: ${theme.spacing(13.5)};
  margin-bottom: ${theme.spacing(2)};
  margin-top: ${theme.spacing(3)};
  margin-right: ${theme.spacing(4)};
  transition: 0.3s ease;
  transform: ${hovered ? 'translateX(0)' : 'translateX(-57%)'};
`
);

export default IncentiveLeveraged;
