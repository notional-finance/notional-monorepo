import React from 'react';
import { Box, useTheme } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { H1, H3 } from '@notional-finance/mui';
import { VideoPlayerHero } from '@notional-finance/shared-web';

export const SectionOne = () => {
  const theme = useTheme();
  const titleText = (
    <>
      <H3
        accent
        textTransform={'uppercase'}
        letterSpacing={'1px'}
        fontWeight="medium"
      >
        <FormattedMessage
          defaultMessage={'About Notional'}
          description={'section heading'}
        />
      </H3>
      <Box
        sx={{
          display: 'block',
        }}
      >
        <H1 contrast>
          <FormattedMessage
            defaultMessage="<b>Fixing</b> Finance To Work For Everyone"
            values={{
              b: (c: React.ReactNode) => (
                <span style={{ color: theme.palette.info.main }}>{c}</span>
              ),
            }}
          />
        </H1>
      </Box>
    </>
  );

  return (
    <Box
      sx={{
        marginTop: { xs: '52px', md: '61px', lg: '72px' },
      }}
    >
      <VideoPlayerHero
        titleText={titleText}
        videoId="dD3tVNp2uq0"
        height="865px"
      />
    </Box>
  );
};
