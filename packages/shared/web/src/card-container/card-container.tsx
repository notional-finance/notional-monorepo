import { styled, Box, useTheme } from '@mui/material';
import { useEffect } from 'react';
import { FormattedMessage, MessageDescriptor } from 'react-intl';
import { colors } from '@notional-finance/styles';
import { HeadingSubtitle, H1 } from '@notional-finance/mui';

export interface CardContainerProps {
  heading: MessageDescriptor;
  subtitle: MessageDescriptor;
  cards: React.ReactNode[];
  children?: React.ReactNode;
}

export function CardContainer({
  heading,
  subtitle,
  cards,
  children,
}: CardContainerProps) {
  const theme = useTheme();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const titleText = (
    // TODO: figure out the actual margin here
    <Box sx={{ marginLeft: '120px' }}>
      <H1 gutter="default" style={{ color: colors.white }}>
        <FormattedMessage {...heading} />
      </H1>
      <HeadingSubtitle
        fontWeight="regular"
        maxWidth={theme.spacing(96)}
        style={{ color: colors.white }}
      >
        <FormattedMessage {...subtitle} />
      </HeadingSubtitle>
    </Box>
  );
  return (
    <StyledContainer>
      <Box
        sx={{
          background:
            'linear-gradient(to right, #053542 32.07%, #06657e 123.72%)',
          height: '550px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {titleText}
      </Box>
      <StyledCardList>
        {cards.map((c, i) => (
          <StyledCard key={`key-${i}`}>{c}</StyledCard>
        ))}
      </StyledCardList>
      <Box
        sx={{
          padding: {
            xs: theme.spacing(0, 4),
            md: theme.spacing(0, 8),
            lg: theme.spacing(0, 16),
          },
        }}
      >
        {children}
      </Box>
    </StyledContainer>
  );
}

const StyledContainer = styled(Box)`
  margin: 0 auto;
  overflow: hidden;
  margin-bottom: 200px;
`;

const StyledCardList = styled('ul')`
  display: inline-flex;
  flex-wrap: wrap;
  justify-content: center;
  overflow: visible;
  margin-top: -196px;
  margin-bottom: 64px;
  width: 100%;
  grid-gap: 40px;
`;

const StyledCard = styled('li')`
  margin-top: 10px;
  margin-bottom: 10px;

  @media (max-width: 600px) {
    margin: 10px 0;
  }
`;
