import { styled, Box, useTheme, SxProps } from '@mui/material';
import { useEffect } from 'react';
import { FormattedMessage, MessageDescriptor } from 'react-intl';
import { colors } from '@notional-finance/styles';
import { HeadingSubtitle, H1 } from '@notional-finance/mui';

export interface CardContainerProps {
  heading: MessageDescriptor;
  subtitle: MessageDescriptor;
  children?: React.ReactNode;
  sx?: SxProps;
}

export function CardContainer({
  heading,
  subtitle,
  children,
  sx,
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
    <StyledContainer sx={{ ...sx }}>
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
      <StyledCardList>{children}</StyledCardList>
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
