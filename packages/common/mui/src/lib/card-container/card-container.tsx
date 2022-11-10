import { styled, Box, useTheme } from '@mui/material';
import { useEffect } from 'react';
import { FormattedMessage, MessageDescriptor } from 'react-intl';
import { HeadingSubtitle, H1 } from '../typography/typography';

export interface CardContainerProps {
  heading: MessageDescriptor;
  subtitle: MessageDescriptor;
  cards: React.ReactNode[];
  children?: React.ReactNode;
}

const StyledContainer = styled(Box)`
  padding: 160px 32px 96px 32px;
  max-width: 1440px;
  margin: 0 auto;
  overflow: hidden;

  @media (max-width: 1440px) {
    padding: 80px 16px 48px 16px;
  }

  @media (max-width: 800px) {
    padding: 40px 16px 24px 16px;
  }
`;

const StyledCardList = styled('ul')`
  display: inline-flex;
  flex-wrap: wrap;
  justify-content: center;
  overflow: visible;
  margin-top: 64px;
  margin-bottom: 64px;
  width: 100%;
`;

const StyledCard = styled('li')`
  margin-top: 10px;
  margin-bottom: 10px;
  margin-right: 40px;

  @media (max-width: 600px) {
    margin: 10px 0;
  }
`;

export function CardContainer({ heading, subtitle, cards, children }: CardContainerProps) {
  const theme = useTheme();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <StyledContainer>
      <Box>
        <H1 gutter="default">
          <FormattedMessage {...heading} />
        </H1>
        <HeadingSubtitle fontWeight="regular" maxWidth={theme.spacing(96)}>
          <FormattedMessage {...subtitle} />
        </HeadingSubtitle>
      </Box>
      <StyledCardList>
        {cards.map((c, i) => (
          <StyledCard key={`key-${i}`}>{c}</StyledCard>
        ))}
      </StyledCardList>
      {children}
    </StyledContainer>
  );
}
