import { styled, Box, useTheme, SxProps } from '@mui/material';
import { useEffect } from 'react';
import { FormattedMessage, MessageDescriptor } from 'react-intl';
import { colors } from '@notional-finance/styles';
import { HeadingSubtitle, H1, ExternalLink } from '@notional-finance/mui';

export interface CardContainerProps {
  heading: MessageDescriptor;
  subtitle: MessageDescriptor;
  linkText: MessageDescriptor;
  docsLink: string;
  children?: React.ReactNode;
  sx?: SxProps;
}

export function CardContainer({
  heading,
  subtitle,
  linkText,
  docsLink,
  children,
  sx,
}: CardContainerProps) {
  const theme = useTheme();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <StyledContainer sx={{ ...sx }}>
      <Box
        sx={{
          background:
            'linear-gradient(to right, #053542 32.07%, #06657e 123.72%)',
          height: '550px',
          display: 'flex',
          alignItems: 'center',
          minWidth: '100%',
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: '1335px',
            display: 'flex',
            flexDirection: 'column',
            margin: 'auto',
          }}
        >
          <H1 gutter="default" style={{ color: colors.white }}>
            <FormattedMessage {...heading} />
          </H1>
          <Box sx={{ width: '500px' }}>
            <HeadingSubtitle
              fontWeight="regular"
              maxWidth={theme.spacing(96)}
              style={{ color: colors.white }}
            >
              <FormattedMessage {...subtitle} />
            </HeadingSubtitle>
            <ExternalLink
              href={docsLink}
              textDecoration
              style={{ color: theme.palette.info.accent }}
            >
              <FormattedMessage {...linkText} />
            </ExternalLink>
          </Box>
        </Box>
      </Box>
      <StyledCardList>{children}</StyledCardList>
    </StyledContainer>
  );
}

const StyledContainer = styled(Box)(
  ({ theme }) => `
  margin: 0 auto;
  overflow: hidden;
  margin-bottom: ${theme.spacing(25)};
  width: 100%;
`
);

const StyledCardList = styled('ul')(
  ({ theme }) => `
  display: inline-flex;
  flex-wrap: wrap;
  justify-content: center;
  overflow: visible;
  margin-top: -${theme.spacing(24.5)};
  margin-bottom: ${theme.spacing(22)};
  width: 100%;
  grid-gap: ${theme.spacing(5)};
`
);
