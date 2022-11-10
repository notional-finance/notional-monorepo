import { defineMessages, FormattedMessage } from 'react-intl';
import aboutPageBuild from '@notional-finance/assets/icons/marketing/about-page-build.svg';
import aboutPageDiscuss from '@notional-finance/assets/icons/marketing/about-page-discuss.svg';
import aboutPageVote from '@notional-finance/assets/icons/marketing/about-page-vote.svg';
import { Box, useTheme } from '@mui/material';
import {
  BlocksIcon,
  DiscordIcon,
  GovernanceIcon,
} from '@notional-finance/icons';
import { H2, H3, Button } from '@notional-finance/mui';

const aboutActions = [
  {
    ...defineMessages({
      title: {
        description: 'title',
        defaultMessage: 'Discuss',
      },
      description: {
        description: 'description',
        defaultMessage:
          'Join an open forum and deliberate on protocol-related issues, ideas and the future of fixed rates.',
      },
      callToAction: {
        description: 'call to action',
        defaultMessage: 'Join Us on Discord',
      },
    }),
    ctaIcon: DiscordIcon,
    image: aboutPageDiscuss,
    href: 'https://discord.notional.finance',
  },
  {
    ...defineMessages({
      title: {
        description: 'title',
        defaultMessage: 'Vote',
      },
      description: {
        description: 'description',
        defaultMessage:
          'Vote on risk parameter settings and community-led proposals.',
      },
      callToAction: {
        description: 'call to action',
        defaultMessage: 'Notional Governance',
      },
    }),
    ctaIcon: GovernanceIcon,
    image: aboutPageVote,
    href: 'https://snapshot.org/#/notional.eth',
  },
  {
    ...defineMessages({
      title: {
        description: 'title',
        defaultMessage: 'Build',
      },
      description: {
        description: 'description',
        defaultMessage:
          "Apply for a grant from the Notional Finance Foundation to fund your project and contribute to the growth of Notional's fixed-rate ecosystem.",
      },
      callToAction: {
        description: 'call to action',
        defaultMessage: 'Apply for a Grant',
      },
    }),
    ctaIcon: BlocksIcon,
    image: aboutPageBuild,
    href: 'https://community.notional.finance',
  },
];

export const AboutActions = () => {
  const theme = useTheme();
  return (
    <Box
      id="about-actions"
      sx={{
        width: '90%',
        margin: theme.spacing(0, 'auto'),
      }}
    >
      {aboutActions.map(
        ({ ctaIcon, title, description, callToAction, image, href }, i) => {
          const imageRight = i % 2 === 0;
          const actionText = (
            <Box
              sx={{
                maxWidth: { xs: '100%', lg: '50%' },
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <H2
                accent
                textTransform={'uppercase'}
                letterSpacing={'1px'}
                marginBottom={theme.spacing(2)}
              >
                <FormattedMessage {...title} />
              </H2>
              <H3
                fontWeight="regular"
                lineHeight={2}
                marginBottom={theme.spacing(6)}
              >
                <FormattedMessage {...description} />
              </H3>
              <Button
                variant="contained"
                href={href}
                size="large"
                sx={{
                  alignSelf: { xs: 'center', md: 'start' },
                  background: theme.gradient.landing,
                  border: theme.shape.borderHighlight,
                  maxWidth: theme.spacing(32),
                }}
              >
                {ctaIcon({
                  sx: {
                    color: theme.palette.common.white,
                    marginRight: '.5rem',
                  },
                })}
                <FormattedMessage {...callToAction} />
              </Button>
            </Box>
          );

          const actionImage = <img src={image} alt={title.defaultMessage} />;
          const actionImageDesktop = (
            <Box sx={{ display: { xs: 'none', lg: 'block' } }}>
              {actionImage}
            </Box>
          );
          const actionImageMobile = (
            <Box sx={{ display: { xs: 'block', lg: 'none' } }}>
              {actionImage}
            </Box>
          );
          return (
            <Box
              sx={{
                display: 'inline-flex',
                marginBottom: { xs: theme.spacing(16), lg: theme.spacing(32) },
                flexWrap: 'wrap',
                width: '100%',
                justifyContent: 'space-evenly',
              }}
            >
              {actionImageMobile}
              {imageRight ? actionText : actionImageDesktop}
              {imageRight ? actionImageDesktop : actionText}
            </Box>
          );
        }
      )}
    </Box>
  );
};
