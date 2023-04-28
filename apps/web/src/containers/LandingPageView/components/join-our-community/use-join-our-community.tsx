import { ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';
import discordIcon from '@notional-finance/assets/images/logos/discord-two-tone.svg';
import twitterIcon from '@notional-finance/assets/images/logos/twitter-two-tone.svg';
import youtubeIcon from '@notional-finance/assets/images/logos/youtube-two-tone.svg';
import governanceIcon from '@notional-finance/assets/images/logos/governance-two-tone.svg';
import docsIcon from '@notional-finance/assets/images/logos/docs-two-tone.svg';
import devDocsIcon from '@notional-finance/assets/images/logos/dev-docs-two-tone.svg';

interface JoinOurCommunityProps {
  title: ReactNode;
  link: string;
  icon: string;
  text: ReactNode;
  linkText: ReactNode;
}

export const useJoinOurCommunity = (): JoinOurCommunityProps[] => {
  const communityData = [
    {
      title: <FormattedMessage defaultMessage={'Join Us on Discord'} />,
      link: 'https://discord.notional.finance',
      linkText: <FormattedMessage defaultMessage={'Discord'} />,
      icon: discordIcon,
      text: (
        <FormattedMessage
          defaultMessage={
            'Discuss topics in the Notional ecosystem and get support from community members.'
          }
        />
      ),
    },
    {
      title: <FormattedMessage defaultMessage={'User Documentation'} />,
      link: 'https://docs.notional.finance/notional-v2/',
      linkText: <FormattedMessage defaultMessage={'Read Docs'} />,
      icon: docsIcon,
      text: (
        <FormattedMessage
          defaultMessage={'Learn how Notional works and how to use it.'}
        />
      ),
    },
    {
      title: <FormattedMessage defaultMessage={'Follow Us on Twitter'} />,
      link: 'https://twitter.com/NotionalFinance',
      linkText: <FormattedMessage defaultMessage={'Twitter'} />,
      icon: twitterIcon,
      text: (
        <FormattedMessage
          defaultMessage={`Stay up to date with the latest news from Notional in real time.`}
        />
      ),
    },
    {
      title: <FormattedMessage defaultMessage={'Watch Our Youtube'} />,
      link: 'https://www.youtube.com/channel/UC3JxsK1mTxPxRZs6TtGDo5g',
      linkText: <FormattedMessage defaultMessage={'Youtube'} />,
      icon: youtubeIcon,
      text: (
        <FormattedMessage
          defaultMessage={`Access explainer videos, user tutorials, updates from the team, and more.`}
        />
      ),
    },
    {
      title: <FormattedMessage defaultMessage={'Governance Forum'} />,
      link: 'https://forum.notional.finance/',
      linkText: <FormattedMessage defaultMessage={'Governance'} />,
      icon: governanceIcon,
      text: (
        <FormattedMessage
          defaultMessage={`Dive deep into the issues and voice your opinion on Notional's direction.`}
        />
      ),
    },
    {
      title: <FormattedMessage defaultMessage={'Developer Docs'} />,
      link: 'https://docs.notional.finance/developer-documentation/',
      linkText: <FormattedMessage defaultMessage={'Read Docs'} />,
      icon: devDocsIcon,
      text: (
        <FormattedMessage
          defaultMessage={`Dig into the detail and learn how to interact with Notional's smart contracts.`}
        />
      ),
    },
  ];

  return communityData;
};

export default useJoinOurCommunity;
