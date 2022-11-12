import { Box, Typography, useTheme, IconButton } from '@mui/material';
import { ArrowIcon, DiscordIcon } from '@notional-finance/icons';
import { FormattedMessage } from 'react-intl';
import { useRef } from 'react';

export function ConnectCommunity() {
  const theme = useTheme();
  const boxRef = useRef<HTMLDivElement | undefined>();

  return (
    <Box
      ref={boxRef}
      component="a"
      href="https://discord.notional.finance"
      target="_blank"
      rel="noreferrer"
      sx={{
        display: 'flex',
        backgroundColor: theme.palette.background.default,
        padding: '2rem',
        borderTop: '1px solid',
        borderImage: 'linear-gradient(90deg, #004453 0%, #21B3B4 100%)',
        borderImageSlice: '1',
        '&:hover': {
          background: theme.palette.borders.paper,
          transition: '.5s ease',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <DiscordIcon
          sx={{
            color: theme.palette.background.accentDefault,
            fontSize: '3rem',
          }}
        />
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexGrow: 1,
          flexDirection: 'column',
          marginLeft: '1.5rem',
        }}
      >
        <Box sx={{}}>
          <Typography
            variant="h3"
            color={theme.palette.common.black}
            sx={{
              fontWeight: 700,
              fontSize: '1.375rem',
            }}
          >
            <FormattedMessage defaultMessage={'Connect with our community on Discord'} />
          </Typography>
        </Box>
        <Box sx={{}}>
          <Typography
            variant="subtitle1"
            color={theme.palette.borders.accentPaper}
            sx={{
              fontWeight: 500,
              fontSize: '.875rem',
            }}
          >
            <FormattedMessage
              defaultMessage={'Get in touch with the team, we are hear to answer any questions'}
            />
          </Typography>
        </Box>
      </Box>
      <Box>
        <IconButton sx={{ background: theme.gradient.landing }}>
          <ArrowIcon
            sx={{
              transform: 'rotate(90deg)',
              color: theme.palette.common.white,
            }}
          />
        </IconButton>
      </Box>
    </Box>
  );
}

export default ConnectCommunity;
