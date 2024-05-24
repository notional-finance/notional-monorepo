import {
  PieChartIcon,
  VaultIcon,
  BarChartIcon,
  // StakeIcon,
  DocsIcon,
  InsuranceIcon,
  NotionalPlainIcon,
  BugBountyIcon,
  GovernanceIcon,
  DashboardIcon,
  BlocksIcon,
  DeveloperDocsIcon,
  ForumIcon,
  DiscordPlainIcon,
  ResourcesIcon,
  BarChartLateralIcon,
  CoinsCircleIcon,
  CoinsIcon,
} from '@notional-finance/icons';
import { MOBILE_SUB_NAV_ACTIONS } from '@notional-finance/util';
import {
  GitHub,
  Twitter,
  YouTube,
  DescriptionOutlined,
} from '@mui/icons-material';
import TuneIcon from '@mui/icons-material/Tune';
import { useTheme } from '@mui/material/styles';
import { FormattedMessage } from 'react-intl';
import { useSelectedNetwork } from '@notional-finance/notionable-hooks';

export const useResourceLinks = () => {
  const theme = useTheme();
  return {
    learn: {
      title: <FormattedMessage defaultMessage={'LEARN'} />,
      data: [
        {
          key: 'user_documentation',
          label: <FormattedMessage defaultMessage={'User Documentation'} />,
          link: 'https://docs.notional.finance/notional-v3',
          iconImg: (
            <DocsIcon
              sx={{ color: theme.palette.common.black, fontSize: '1.125rem' }}
            />
          ),
        },
        {
          key: 'developer_documentation',
          label: (
            <FormattedMessage defaultMessage={'Developer Documentation'} />
          ),
          link: 'https://docs.notional.finance/v3-technical-docs/deployed-contracts/notional-v3',
          iconImg: (
            <DeveloperDocsIcon
              sx={{ color: theme.palette.common.black, fontSize: '1.125rem' }}
            />
          ),
        },
        {
          key: 'video_tutorials',
          label: <FormattedMessage defaultMessage={'Video Tutorials'} />,
          noBottomBorder: true,
          link: 'https://www.youtube.com/playlist?list=PLnKdM8f8QEJ2lJ59ZjhVCcJvrT056X0Ga',
          iconImg: (
            <YouTube
              sx={{ color: theme.palette.common.black, fontSize: '1.125rem' }}
            />
          ),
        },
      ],
    },
    governance: {
      title: <FormattedMessage defaultMessage={'GOVERNANCE'} />,
      data: [
        {
          key: 'governance_portal',
          label: <FormattedMessage defaultMessage={'Governance Portal'} />,
          link: '/governance',
          iconImg: (
            <GovernanceIcon
              sx={{ color: theme.palette.common.black, fontSize: '1.125rem' }}
            />
          ),
        },
        {
          key: 'protocol_parameters',
          label: <FormattedMessage defaultMessage={'Protocol Parameters'} />,
          link: 'https://docs.notional.finance/governance',
          iconImg: (
            <TuneIcon
              sx={{ color: theme.palette.common.black, fontSize: '1.125rem' }}
            />
          ),
        },
        {
          key: 'governance_forum',
          label: <FormattedMessage defaultMessage={'Governance Forum'} />,
          noBottomBorder: true,
          link: 'https://forum.notional.finance/',
          iconImg: (
            <ForumIcon
              sx={{ color: theme.palette.common.black, fontSize: '1.125rem' }}
            />
          ),
        },
      ],
    },
    community: {
      title: <FormattedMessage defaultMessage={'COMMUNITY'} />,
      data: [
        {
          key: 'blog',
          label: <FormattedMessage defaultMessage={'Blog'} />,
          link: 'https://blog.notional.finance/',
          iconImg: (
            <DescriptionOutlined
              sx={{ color: theme.palette.common.black, fontSize: '1.125rem' }}
            />
          ),
        },
        {
          key: 'discord',
          label: <FormattedMessage defaultMessage={'Discord'} />,
          link: 'https://discord.notional.finance',
          iconImg: (
            <DiscordPlainIcon
              sx={{ color: theme.palette.common.black, fontSize: '1.125rem' }}
            />
          ),
        },
        {
          key: 'github',
          label: <FormattedMessage defaultMessage={'Github'} />,
          link: 'https://github.com/notional-finance/contracts-v2',
          iconImg: (
            <GitHub
              sx={{ color: theme.palette.common.black, fontSize: '1.125rem' }}
            />
          ),
        },
        {
          key: 'twitter',
          label: <FormattedMessage defaultMessage={'Twitter'} />,
          link: 'https://twitter.com/NotionalFinance',
          iconImg: (
            <Twitter
              sx={{ color: theme.palette.common.black, fontSize: '1.125rem' }}
            />
          ),
        },
        {
          key: 'youtube',
          label: <FormattedMessage defaultMessage={'Youtube'} />,
          noBottomBorder: true,
          link: 'https://www.youtube.com/channel/UC3JxsK1mTxPxRZs6TtGDo5g',
          iconImg: (
            <YouTube
              sx={{ color: theme.palette.common.black, fontSize: '1.125rem' }}
            />
          ),
        },
      ],
    },
  };
};

export const useSideDrawerLinks = (dataKey: MOBILE_SUB_NAV_ACTIONS) => {
  const theme = useTheme();
  const network = useSelectedNetwork();

  const mobileSubNavData = {
    [MOBILE_SUB_NAV_ACTIONS.EARN_YIELD]: [
      {
        key: 'lend-fixed',
        label: <FormattedMessage defaultMessage={'Lend Fixed'} />,
        link: `/lend-fixed/${network}`,
        iconImg: (
          <BarChartLateralIcon
            className="color-stroke"
            sx={{ fontSize: '1.125rem', fill: theme.palette.common.black }}
          />
        ),
      },
      {
        key: 'lend-variable',
        label: <FormattedMessage defaultMessage={'Lend Variable'} />,
        link: `/lend-variable/${network}`,
        iconImg: (
          <BarChartIcon
            sx={{
              fontSize: '1.125rem',
              fill: theme.palette.common.black,
            }}
          />
        ),
      },
      {
        key: 'liquidity-variable',
        label: <FormattedMessage defaultMessage={'Provide Liquidity'} />,
        link: `/liquidity-variable/${network}`,
        iconImg: (
          <PieChartIcon
            className="color-stroke"
            sx={{
              fontSize: '1.125rem',
              stroke: 'transparent',
              fill: theme.palette.common.black,
            }}
          />
        ),
      },
      {
        key: 'vaults',
        label: <FormattedMessage defaultMessage={'Leveraged Vaults'} />,
        link: `/vaults/${network}`,
        iconImg: (
          <VaultIcon
            className="color-stroke"
            sx={{ fontSize: '1.125rem', fill: theme.palette.common.black }}
          />
        ),
      },
      {
        key: 'liquidity-leveraged',
        label: <FormattedMessage defaultMessage={'Leveraged Liquidity'} />,
        link: `/liquidity-leveraged/${network}`,
        iconImg: (
          <PieChartIcon
            className="color-stroke"
            sx={{
              fontSize: '1.125rem',
              stroke: 'transparent',
              fill: theme.palette.common.black,
            }}
          />
        ),
      },
      // {
      //   key: 'stake',
      //   label: <FormattedMessage defaultMessage={'Stake Note'} />,
      //   link: '/stake/ETH',
      //   iconImg: (
      //     <StakeIcon
      //       className="color-stroke"
      //       sx={{
      //         fontSize: '1.125rem',
      //         stroke: theme.palette.common.black,
      //         fill: 'transparent',
      //       }}
      //     />
      //   ),
      // },
    ],
    [MOBILE_SUB_NAV_ACTIONS.BORROW]: [
      {
        key: 'borrow-fixed',
        label: <FormattedMessage defaultMessage={'Borrow Fixed'} />,
        link: `/borrow-fixed/${network}`,
        iconImg: (
          <CoinsIcon
            sx={{
              fontSize: '1.125rem',
              fill: 'transparent',
              stroke: theme.palette.common.black,
            }}
          />
        ),
      },
      {
        key: 'borrow-variable',
        label: <FormattedMessage defaultMessage={'Borrow Variable'} />,
        link: `/borrow-variable/${network}`,
        iconImg: (
          <CoinsCircleIcon
            sx={{ color: theme.palette.common.black, fontSize: '1.125rem' }}
          />
        ),
      },
    ],
    [MOBILE_SUB_NAV_ACTIONS.COMPANY]: [
      {
        key: 'about_notional',
        label: <FormattedMessage defaultMessage={'About Notional'} />,
        link: '/about',
        iconImg: (
          <NotionalPlainIcon
            sx={{ color: theme.palette.common.black, fontSize: '1.125rem' }}
          />
        ),
      },
      {
        key: 'notional_foundation',
        label: <FormattedMessage defaultMessage={'Notional Foundation'} />,
        link: 'https://blog.notional.finance/notional-grant-program-rollout/',
        iconImg: (
          <BlocksIcon
            sx={{ color: theme.palette.common.black, fontSize: '1.125rem' }}
          />
        ),
      },
      {
        key: 'dashboard',
        label: <FormattedMessage defaultMessage={'Dashboard'} />,
        link: 'https://info.notional.finance/',
        noBottomBorder: true,
        iconImg: (
          <DashboardIcon
            sx={{ color: theme.palette.common.black, fontSize: '1.125rem' }}
          />
        ),
      },
    ],
    [MOBILE_SUB_NAV_ACTIONS.SECURITY]: [
      {
        key: 'security_audits',
        label: <FormattedMessage defaultMessage={'Security Audits'} />,
        link: 'https://github.com/notional-finance/contracts-v2/blob/master/audits/README.md',
        iconImg: (
          <ResourcesIcon
            sx={{ color: theme.palette.common.black, fontSize: '1.125rem' }}
          />
        ),
      },
      {
        key: 'insurance',
        label: <FormattedMessage defaultMessage={'Insurance'} />,
        link: 'https://app.nexusmutual.io/cover/buy/get-quote?address=0x1344A36A1B56144C3Bc62E7757377D288fDE0369',
        iconImg: (
          <InsuranceIcon
            sx={{ color: theme.palette.common.black, fontSize: '1.125rem' }}
          />
        ),
      },
      {
        key: 'bug_bounty',
        label: <FormattedMessage defaultMessage={'Bug Bounty'} />,
        link: 'https://immunefi.com/bounty/notional/',
        iconImg: (
          <BugBountyIcon
            sx={{ color: theme.palette.common.black, fontSize: '1.125rem' }}
          />
        ),
      },
      {
        key: 'protocol_parameters',
        label: <FormattedMessage defaultMessage={'Protocol Parameters'} />,
        noBottomBorder: true,
        link: 'https://docs.notional.finance/governance',
        iconImg: (
          <GovernanceIcon
            sx={{ color: theme.palette.common.black, fontSize: '1.125rem' }}
          />
        ),
      },
    ],
  };

  return mobileSubNavData[dataKey];
};
