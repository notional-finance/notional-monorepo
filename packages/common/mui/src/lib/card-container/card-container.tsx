import { styled, Box, useTheme } from '@mui/material';
import { VideoPlayerHero } from '@notional-finance/shared-web';
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
  margin: 0 auto;
  overflow: hidden;
`;

const StyledCardList = styled('ul')(
  ({ theme }) => `
  display: inline-flex;
  flex-wrap: wrap;
  justify-content: center;
  overflow: visible;
  margin-top: -96px;
  margin-bottom: 64px;
  width: 100%;

  ${theme.breakpoints.down('lg')} {
    margin-top: 0px;
  }
`
);

const StyledCard = styled('li')`
  margin-top: 10px;
  margin-bottom: 10px;
  margin-right: 40px;

  @media (max-width: 600px) {
    margin: 10px 0;
  }
`;

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
    <>
      <H1 gutter="default">
        <FormattedMessage {...heading} />
      </H1>
      <HeadingSubtitle fontWeight="regular" maxWidth={theme.spacing(96)}>
        <FormattedMessage {...subtitle} />
      </HeadingSubtitle>
    </>
  );
  return (
    <StyledContainer>
      <VideoPlayerHero
        titleText={titleText}
        videoId="dD3tVNp2uq0"
        heightUnits={80}
      />
      <StyledCardList>
        {cards.map((c, i) => (
          <StyledCard key={`key-${i}`}>{c}</StyledCard>
        ))}
      </StyledCardList>
      {children}
    </StyledContainer>
  );
}
