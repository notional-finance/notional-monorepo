import { useState } from 'react';
import { Box, styled, useTheme } from '@mui/material';
import { VaultCard } from './vault-card';
import { Caption, LinkText } from '../../typography/typography';
import ProgressIndicator from '../../progress-indicator/progress-indicator';
import { LeveragedDashboardProps } from '../product-dashboard';
import { NotionalTheme } from '@notional-finance/styles';
import { FormattedMessage } from 'react-intl';

interface ContainerProps {
  hasLeveragedPosition?: boolean;
  hasNegativePosition?: boolean;
  theme: NotionalTheme;
}

export const LeveragedDashboard = ({
  productData,
  isLoading,
}: LeveragedDashboardProps) => {
  const theme = useTheme();
  const [showNegativeYields, setShowNegativeYields] = useState(false);

  return (
    <Box sx={{ marginTop: isLoading ? theme.spacing(7.5) : '0px' }}>
      {!isLoading ? (
        productData.map(
          (
            { sectionTitle, data, hasLeveragedPosition, hasNegativePosition },
            index
          ) => (
            <Container
              key={index}
              hasLeveragedPosition={hasLeveragedPosition}
              hasNegativePosition={hasNegativePosition}
              theme={theme}
            >
              {!showNegativeYields && hasNegativePosition && (
                <LinkText
                  onClick={() => setShowNegativeYields(true)}
                  sx={{ cursor: 'pointer', textAlign: 'left' }}
                >
                  <FormattedMessage defaultMessage={'See negative yields'} />
                </LinkText>
              )}
              {!hasNegativePosition && (
                <Caption
                  sx={{
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    textAlign: 'left',
                    marginBottom: theme.spacing(2),
                    letterSpacing: '1.4px',
                  }}
                >
                  {sectionTitle}
                </Caption>
              )}
              <GridCardContainer>
                {data.map(
                  (
                    {
                      title,
                      apy,
                      tvl,
                      symbol,
                      hasPosition,
                      incentiveValue,
                      organicApyOnly,
                      incentiveSymbol,
                    },
                    index
                  ) => (
                    <div>
                      {showNegativeYields && apy?.includes('-') && (
                        <VaultCard
                          key={index}
                          title={title}
                          apy={apy}
                          tvl={tvl}
                          symbol={symbol}
                          hasPosition={hasPosition}
                          incentiveValue={incentiveValue}
                          incentiveSymbol={incentiveSymbol}
                          organicApyOnly={organicApyOnly}
                        />
                      )}
                      {!apy?.includes('-') && (
                        <VaultCard
                          key={index}
                          title={title}
                          apy={apy}
                          tvl={tvl}
                          symbol={symbol}
                          hasPosition={hasPosition}
                          incentiveValue={incentiveValue}
                          incentiveSymbol={incentiveSymbol}
                          organicApyOnly={organicApyOnly}
                        />
                      )}
                    </div>
                  )
                )}
              </GridCardContainer>
            </Container>
          )
        )
      ) : (
        <ProgressIndicator type="notional" sx={{ height: theme.spacing(57.5) }} />
      )}
    </Box>
  );
};

const Container = styled(Box, {
  shouldForwardProp: (prop: string) =>
    prop !== 'hasLeveragedPosition' && prop !== 'hasNegativePosition',
})(
  ({ hasLeveragedPosition, hasNegativePosition, theme }: ContainerProps) => `
      padding-bottom: ${theme.spacing(4)};
      padding-top: ${hasNegativePosition ? '0px' : theme.spacing(4)};
      padding-left: ${theme.spacing(3)};
      padding-right: ${theme.spacing(3)};
      ${
        hasLeveragedPosition
          ? `
        background: ${theme.palette.background.default};
        `
          : ``
      }
    `
);

const GridCardContainer = styled(Box)(
  ({ theme }) => `
      display: grid;
      gap: ${theme.spacing(3)};
      grid-template-columns: repeat(2, 1fr);
      ${theme.breakpoints.down('sm')} {
          grid-template-columns: repeat(1, 1fr);
      }
        `
);

export default LeveragedDashboard;
