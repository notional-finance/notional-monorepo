import React, { useEffect, useState } from 'react';
import { Box, ThemeProvider } from '@mui/material';
import YouTube from 'react-youtube';
import playButtonSvg from '@notional-finance/assets/icons/icon-play-video.svg';
import aboutUsBackground from '@notional-finance/assets/images/about-us-background.svg';
import { HeadingSubtitle, useWindowDimensions } from '@notional-finance/mui';
import { YouTubePlayer } from 'youtube-player/dist/types';
import { useNotionalTheme } from '@notional-finance/styles';
import { THEME_VARIANTS } from '@notional-finance/util';

export interface VideoPlayerHeroProps {
  videoId: string;
  titleText: React.ReactNode;
  heightUnits: number;
}

export const VideoPlayerHero = ({
  videoId,
  titleText,
  heightUnits,
}: VideoPlayerHeroProps) => {
  const theme = useNotionalTheme(THEME_VARIANTS.DARK);
  const [isVideoPlaying, setVideoPlaying] = useState(false);
  const [videoTarget, setVideoTarget] = useState<YouTubePlayer | undefined>(
    undefined
  );
  const { width } = useWindowDimensions();
  const [videoViewportWidth, setVideoViewportWidth] = useState(515);
  const [videoViewportHeight, setVideoViewportHeight] = useState(292);

  useEffect(() => {
    if (width < 600) {
      setVideoViewportHeight(159);
      setVideoViewportWidth(280);
    } else {
      setVideoViewportHeight(292);
      setVideoViewportWidth(515);
    }
  }, [width]);

  const handleReady = (event: { target: YouTubePlayer }) => {
    setVideoTarget(event.target);
  };

  const playVideo = () => {
    setVideoPlaying(true);
    if (videoTarget) {
      videoTarget.playVideo();
    }
  };

  const stopVideoPlaying = async () => {
    const state = await videoTarget?.getPlayerState();
    // 1 or 3 is playing or buffering
    if (state === 1 || state === 3) return;
    setVideoPlaying(false);
    // Stopping the video resets to the beginning but will also prevent
    // related videos from being shown
    if (videoTarget) videoTarget.stopVideo();
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          width: '100%',
          height: theme.spacing(heightUnits),
          background: {
            md: `url(${aboutUsBackground}) top 0px left 673px no-repeat, ${theme.gradient.heroGradient}`,
            xs: theme.gradient.heroGradient,
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', lg: 'row' },
            justifyContent: 'space-evenly',
            gap: { xs: theme.spacing(6), md: theme.spacing(3) },
            alignItems: 'center',
            width: '84%',
            margin: { xs: '0px auto', md: '0px auto', lg: '0px auto' },
            paddingTop: {
              xs: theme.spacing(heightUnits / 12),
              lg: theme.spacing(heightUnits / 4),
            },
          }}
        >
          <Box sx={{ maxWidth: '680px' }}>{titleText}</Box>
          <Box
            id="header-video"
            sx={{
              height: 'max-content',
              borderRadius: theme.shape.borderRadius(),
              border: `2px solid ${theme.palette.info.accent}`,
              padding: '1.75rem',
              position: 'relative',
              '&:hover': {
                '#video-overlay': {
                  color: 'red',
                  opacity: '0.95',
                  transition: 'opacity 0.25s linear',
                },
                '#video-player': {
                  opacity: '0.05',
                  transition: 'opacity 0.25s linear',
                  visibility: 'visible',
                },
              },
            }}
          >
            <Box
              sx={{
                width: { xs: '280px', sm: '515px' },
                height: { xs: '159px', sm: '292px' },
                position: 'relative',
                background: theme.gradient.heroGradient,
                boxShadow: '0px 4px 10px 0px #142a4a12',
                opacity: 1,
                transition: 'opacity 0.75s linear',
                '&.playing': {
                  opacity: 0,
                  transition: 'opacity 0.75s linear',
                },
                'img#svg-play-button': {
                  margin: 'auto',
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  right: 0,
                  left: 0,
                  borderStyle: 'none',
                },
              }}
              id="video-overlay"
              className={isVideoPlaying ? 'playing' : ''}
              onClick={() => playVideo()}
              onKeyPress={() => playVideo()}
              tabIndex={0}
              role="button"
            >
              <img id="svg-play-button" src={playButtonSvg} alt="play button" />
              <Box
                sx={{
                  display: 'block',
                  position: 'absolute',
                  bottom: { xs: theme.spacing(2), md: theme.spacing(4) },
                  textAlign: 'center',
                  width: '100%',
                }}
              >
                <HeadingSubtitle inline accent>
                  notional
                </HeadingSubtitle>
                <HeadingSubtitle
                  inline
                  // NOTE: enforce the contrast text color via the local theme
                  sx={{ color: theme.palette.typography.main }}
                >
                  .finance
                </HeadingSubtitle>
              </Box>
            </Box>
            <Box
              sx={{
                position: 'absolute',
                top: '28px',
                zIndex: 99,
                opacity: 0,
                transition: 'opacity 0.75s linear',
                visibility: 'hidden',
                '&.playing': {
                  opacity: 1,
                  visibility: 'visible',
                  transition: 'opacity 0.75s linear',
                },
              }}
              className={isVideoPlaying ? 'playing' : ''}
              id="video-player"
            >
              <YouTube
                id="youtube-player"
                videoId={videoId}
                opts={{
                  width: `${videoViewportWidth}`,
                  height: `${videoViewportHeight}`,
                  playerVars: {
                    origin: window.location.hostname,
                  },
                }}
                onReady={handleReady}
                onPlay={() => playVideo()}
                onPause={() => stopVideoPlaying()}
                onEnd={() => stopVideoPlaying()}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};
