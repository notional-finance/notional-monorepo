import React, { useEffect, useState } from 'react';
import { Box, useTheme } from '@mui/material';
import YouTube from 'react-youtube';
import playButtonSvg from '@notional-finance/assets/icons/icon-play-video.svg';
import aboutUsBackground from '@notional-finance/assets/images/about-us-background.svg';
import { useWindowDimensions } from '@notional-finance/mui';
import { YouTubePlayer } from 'youtube-player/dist/types';

export interface VideoPlayerHeroProps {
  videoId: string;
  titleText: React.ReactNode;
  height: string;
}

export const VideoPlayerHero = ({
  videoId,
  titleText,
  height,
}: VideoPlayerHeroProps) => {
  const theme = useTheme();
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
    <Box
      sx={{
        width: '100%',
        height: height,
        background: {
          md: `url(${aboutUsBackground}) top 0px left 673px no-repeat, linear-gradient(267.16deg, #004453 19.48%, #002B36 105.58%)`,
          xs: 'linear-gradient(267.16deg, #004453 19.48%, #002B36 105.58%)',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          justifyContent: 'center',
          alignItems: 'center',
          width: '84%',
          margin: { xs: '0px auto', md: '0px auto', lg: '0px auto' },
          paddingTop: { xs: '75px', lg: '200px' },
        }}
      >
        <Box sx={{ maxWidth: '680px' }}>{titleText}</Box>
        <Box
          id="header-video"
          sx={{
            height: 'max-content',
            borderRadius: '5px',
            border: `2px solid ${theme.palette.info.main}`,
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
              background:
                'linear-gradient(267.16deg, #004453 19.48%, #002B36 105.58%)',
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
                bottom: '2rem',
                textAlign: 'center',
                width: '100%',
              }}
            >
              <Box
                sx={{
                  display: 'inline-block',
                  fontSize: '1rem',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                }}
                component="p"
                color={theme.palette.info.main}
              >
                notional
              </Box>
              <Box
                sx={{
                  display: 'inline-block',
                  fontSize: '1rem',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                }}
                component="p"
                color={theme.palette.background.default}
              >
                .finance
              </Box>
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
              onPlay={() => setVideoPlaying(true)}
              onPause={() => stopVideoPlaying()}
              onEnd={() => stopVideoPlaying()}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
