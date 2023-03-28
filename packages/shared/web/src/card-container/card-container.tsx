import { styled, Box, useTheme, SxProps } from '@mui/material';
import { useEffect } from 'react';
import { FormattedMessage, MessageDescriptor } from 'react-intl';
import { useLocation } from 'react-router-dom';
import { colors } from '@notional-finance/styles';
import { HeadingSubtitle, H1, ExternalLink } from '@notional-finance/mui';
import { CardSubNav } from './card-sub-nav/card-sub-nav';

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
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <StyledContainer sx={{ ...sx }}>
      <Box
        sx={{
          background: 'linear-gradient(90deg, #053542 28.68%, #06657E 126.35%)',
          height: '550px',
          display: 'flex',
          alignItems: 'center',
          minWidth: '100%',
        }}
      >
        <StyledTopContent>
          {/* NOTE: this conditional is temporary until variable borrowing is introduced */}
          {!pathname.includes('borrow') && <CardSubNav />}
          <H1 gutter="default" style={{ color: colors.white }}>
            <FormattedMessage {...heading} />
          </H1>
          <Box
            sx={{
              width: {
                xs: 'auto',
                sm: 'auto',
                md: theme.spacing(62),
                lg: theme.spacing(62),
              },
            }}
          >
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
        </StyledTopContent>
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

const StyledTopContent = styled(Box)(
  ({ theme }) => `
  width: 100%;
  max-width: 1335px;
  min-height: ${theme.spacing(33)};
  display: flex;
  flex-direction: column;
  margin: auto;
  ${theme.breakpoints.down('lg')} {
    margin-left: ${theme.spacing(6)};
  }
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
