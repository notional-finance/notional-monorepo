import { FormattedMessage, MessageDescriptor } from 'react-intl';
import { H1, H3, HeadingSubtitle } from '@notional-finance/mui';
import { Box, useTheme } from '@mui/material';
import twitterLogo from '@notional-finance/assets/images/logos/logo-twitter-dark.svg';
import githubLogo from '@notional-finance/assets/images/logos/logo-github-dark.svg';
import linkedinLogo from '@notional-finance/assets/images/logos/logo-linkedin-dark.svg';
import telegramLogo from '@notional-finance/assets/images/logos/logo-telegram-dark.svg';
import emailLogo from '@notional-finance/assets/images/logos/logo-email-dark.svg';
import { TeamData } from './config';

type SocialProps = {
  name: string;
  link: string;
};
type TeamMemberCardProps = {
  name: string;
  social: SocialProps[];
  profpic: string;
  displayName: MessageDescriptor;
  title: MessageDescriptor;
  description: MessageDescriptor;
};

const MeetTheTeam = () => {
  const theme = useTheme();

  const GetSocialIcons = (socialData: SocialProps[]) => {
    const socialLogos: Record<string, string> = {
      twitter: twitterLogo,
      linkedin: linkedinLogo,
      github: githubLogo,
      telegram: telegramLogo,
      email: emailLogo,
    };

    return (
      <>
        {socialData.map((data: SocialProps) => (
          <li className="data-icon" key={data.name}>
            <a href={data.link} target="_blank" rel="noreferrer">
              <img
                className={data.name}
                src={socialLogos[data.name]}
                alt={data.name}
                width={36}
              />
            </a>
          </li>
        ))}
      </>
    );
  };

  const TeamMemberCard = ({
    name,
    profpic,
    social,
    displayName,
    title,
    description,
  }: TeamMemberCardProps): JSX.Element => {
    return (
      <>
        <Box
          sx={{
            backgroundColor: theme.palette.common.white,
            boxShadow: theme.shape.shadowLandingPage,
            borderRadius: theme.shape.borderRadius(),
            width: theme.spacing(45),
            height: theme.spacing(70),
            marginTop: theme.spacing(8),
            padding: { xs: theme.spacing(5, 4), md: theme.spacing(5, 5) },
            position: 'relative',
            '.photo': {
              width: theme.spacing(10),
              height: theme.spacing(10),
            },
            '.social-list': {
              position: 'absolute',
              bottom: 0,
              display: 'inline-flex',
              marginBottom: theme.spacing(6),
              li: {
                marginRight: theme.spacing(2),
              },
            },
          }}
        >
          <Box>
            <img className="photo" src={profpic} alt={name} />
            <H3
              sx={{
                marginTop: theme.spacing(5),
                marginBottom: theme.spacing(3),
              }}
              fontWeight="medium"
            >
              <FormattedMessage {...displayName} />
            </H3>
            <HeadingSubtitle accent marginBottom={theme.spacing(6)}>
              <FormattedMessage {...title} />
            </HeadingSubtitle>
            <HeadingSubtitle sx={{ marginTop: theme.spacing(3) }}>
              <FormattedMessage {...description} />
            </HeadingSubtitle>
          </Box>
          <ul className="social-list">{GetSocialIcons(social)}</ul>
        </Box>
        {name === 'jwu' && <Box sx={{ flexBasis: '100%', height: 0 }}></Box>}
      </>
    );
  };

  return (
    <Box
      sx={{
        backgroundImage: theme.gradient.landing,
        width: '100%',
        paddingTop: theme.spacing(18),
        paddingBottom: theme.spacing(18),
      }}
    >
      <H1 align="center" contrast>
        <FormattedMessage
          defaultMessage={'Meet the Team'}
          description="section heading"
        />
      </H1>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          maxWidth: '1300px',
          margin: 'auto',
          gap: '0px 60px',
        }}
      >
        {TeamData.map((teamMember: TeamMemberCardProps) => (
          <TeamMemberCard {...teamMember} key={teamMember.name} />
        ))}
      </Box>
    </Box>
  );
};

export default MeetTheTeam;
