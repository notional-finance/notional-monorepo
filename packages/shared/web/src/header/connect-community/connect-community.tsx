import { Box, useTheme, IconButton } from '@mui/material';
import { Body, H3 } from '@notional-finance/mui';
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
        alignItems: 'center',
        backgroundColor: theme.palette.background.default,
        padding: theme.spacing(4),
        paddingLeft: theme.spacing(10),
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
            fontSize: theme.spacing(10),
          }}
        />
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexGrow: 1,
          flexDirection: 'column',
          marginLeft: theme.spacing(3),
        }}
      >
        <H3>
          <FormattedMessage
            defaultMessage={'Connect with our community on Discord'}
          />
        </H3>
        <Body>
          <FormattedMessage
            defaultMessage={
              'Get in touch with the team, we are hear to answer any questions'
            }
          />
        </Body>
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          paddingRight: theme.spacing(10),
        }}
      >
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
