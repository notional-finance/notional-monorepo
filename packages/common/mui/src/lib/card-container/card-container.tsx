import { styled, Box, useTheme } from '@mui/material';
import { VideoPlayerHero } from '@notional-finance/shared-web';
import { useEffect } from 'react';
import { FormattedMessage, MessageDescriptor } from 'react-intl';
import { HeadingSubtitle, H1 } from '../typography/typography';

export interface CardContainerProps {
  heading: MessageDescriptor;
  subtitle: MessageDescriptor;
  cards: React.ReactNode[];
  videoId?: string;
  children?: React.ReactNode;
}

const StyledContainer = styled(Box)`
  margin: 0 auto;
  overflow: hidden;
  margin-bottom: 64px;
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
  videoId,
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
      {videoId ? (
        <VideoPlayerHero
          titleText={titleText}
          videoId={videoId}
          heightUnits={80}
        />
      ) : (
        <Box
          sx={{
            margin: {
              xs: theme.spacing(4, 'auto'),
              md: theme.spacing(8, 'auto'),
              lg: theme.spacing(20, 'auto'),
            },
            padding: {
              xs: theme.spacing(0, 4),
              md: theme.spacing(0, 8),
              lg: theme.spacing(0, 16),
            },
          }}
        >
          {titleText}
        </Box>
      )}
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
