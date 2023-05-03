import { useState, useEffect } from 'react';
import { useTheme, Box, styled } from '@mui/material';
import { ExternalLink, SmallInput } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import { NotionalTheme, colors } from '@notional-finance/styles';
import { useDashboardLinks } from '../use-dashboard-links';
import { DashboardLinks } from './dashboard-links';
import { DashboardLinksMobile } from './dashboard-links-mobile';
import { ArrowRightIcon } from '@notional-finance/icons';

interface FadeBoxProps {
  fadeActive: boolean;
  theme: NotionalTheme;
}

export const DashboardCarousel = () => {
  const theme = useTheme();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const dashboardLinks = useDashboardLinks();

  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(() => {
        setCurrentImageIndex(
          (currentImageIndex) => (currentImageIndex + 1) % dashboardLinks.length
        );
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [dashboardLinks.length, isPaused]);

  const handleImageHover = (index, isHovered) => {
    setIsPaused(isHovered);
    setCurrentImageIndex(index);
  };

  return (
    <OuterContainer>
      <DashboardLinks
        currentImageIndex={currentImageIndex}
        handleImageHover={handleImageHover}
      />
      <DashboardLinksMobile
        currentImageIndex={currentImageIndex}
        handleImageHover={handleImageHover}
      />
      <FadeCarouselWrapper>
        <ViewDashboard>
          <ExternalLink href={dashboardLinks[currentImageIndex].link}>
            <FormattedMessage defaultMessage={'View Dashboard'} />
            <ArrowRightIcon
              fill="white"
              sx={{ height: '14px', marginLeft: theme.spacing(2) }}
            />
          </ExternalLink>
        </ViewDashboard>
        {dashboardLinks.map(({ image }, index) => {
          return (
            <ExternalLink
              href={dashboardLinks[currentImageIndex].link}
              key={index}
            >
              <FadeBox
                fadeActive={currentImageIndex === index}
                theme={theme}
                src={image}
                alt={`Image ${index + 1}`}
                className="fade"
              />
            </ExternalLink>
          );
        })}
      </FadeCarouselWrapper>
    </OuterContainer>
  );
};

const OuterContainer = styled(Box)(
  ({ theme }) => `
    display: flex;
    max-width: ${theme.breakpoints.values.lg}px;
    justify-content: end;
    margin: auto;
    overflow: hidden;
    ${theme.breakpoints.down('smLanding')} {
      flex-direction: column;
      width: 90%;
    }
      `
);

const FadeBox = styled('img', {
  shouldForwardProp: (prop: string) => prop !== 'fadeActive',
})(
  ({ fadeActive, theme }: FadeBoxProps) => `
  position: absolute;
  overflow: hidden;
  width: 803px;
  height: 560px;
  opacity: 0;
  transition: opacity 1.5s ease-in-out;
  opacity: ${fadeActive ? '1' : '0'};
  ${theme.breakpoints.down('mdLanding')} {
    width: 703px;
    height: 460px;
  }
`
);

const FadeCarouselWrapper = styled(Box)(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  width: 803px;
  margin-top: -82px;
  margin-right: -100px;
  ${theme.breakpoints.down('mdLanding')} {
    margin-top: 0px;
    width: 703px;
  }
  ${theme.breakpoints.down('smLanding')} {
    margin: auto;
   }
`
);

const ViewDashboard = styled(SmallInput)(
  ({ theme }) => `
  display: none;
  ${theme.breakpoints.down('smLanding')} {
    display: flex;
    align-items: center;
    color: ${colors.white};
    margin-left: ${theme.spacing(3.75)};
    margin-bottom: ${theme.spacing(2)};
   }
`
);

export default DashboardCarousel;
