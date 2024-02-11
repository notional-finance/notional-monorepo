import jwu from '@notional-finance/assets/images/team/jwu.png';
import pgendron from '@notional-finance/assets/images/team/pgendron.png';
import twoodward from '@notional-finance/assets/images/team/twoodward.png';
import ipetsch from '@notional-finance/assets/images/team/ipetsch.png';
import mgarrett from '@notional-finance/assets/images/team/mgarrett.png';
import { defineMessages } from 'react-intl';

export const TeamData = [
  {
    name: 'twoodward',
    ...defineMessages({
      displayName: {
        description: 'team member name',
        defaultMessage: 'Teddy Woodward',
      },
      title: {
        description: 'team member title',
        defaultMessage: 'Co-Founder | CEO',
      },
      description: {
        description: 'team member title',
        defaultMessage:
          'Interest rate swap trader at Barclays Investment Bank & crypto trader at Ayanda Capital.',
      },
    }),
    social: [
      {
        name: 'twitter',
        link: 'https://twitter.com/teddywoodward',
      },
      {
        name: 'linkedin',
        link: 'https://www.linkedin.com/in/teddy-woodward-829b204a/',
      },
    ],
    profpic: twoodward,
  },
  {
    name: 'jwu',
    ...defineMessages({
      displayName: {
        description: 'team member name',
        defaultMessage: 'Jeff Wu',
      },
      title: {
        description: 'team member title',
        defaultMessage: 'Co-Founder | CTO',
      },
      description: {
        description: 'team member title',
        defaultMessage:
          'Data engineering lead at Atlassian & blockchain product manager at Splunk.',
      },
    }),
    social: [
      {
        name: 'github',
        link: 'https://github.com/jeffywu/',
      },
      {
        name: 'linkedin',
        link: 'https://www.linkedin.com/in/jeffywu/',
      },
    ],
    profpic: jwu,
  },
  {
    name: 'pgendron',
    ...defineMessages({
      displayName: {
        description: 'team member name',
        defaultMessage: 'Pierre-Yves Gendron',
      },
      title: {
        description: 'team member title',
        defaultMessage: 'Risk Analyst',
      },
      description: {
        description: 'team member title',
        defaultMessage:
          'Senior Consultant in the risk advisory practice at KPMG, previously at Accuracy Canada.',
      },
    }),
    social: [
      {
        name: 'twitter',
        link: 'https://twitter.com/pierreyvesg7',
      },
      {
        name: 'linkedin',
        link: 'https://www.linkedin.com/in/pierre-yves-gendron-m-sc-caia-437400b0/',
      },
    ],
    profpic: pgendron,
  },
  {
    name: 'ipetsch',
    ...defineMessages({
      displayName: {
        description: 'team member name',
        defaultMessage: 'Isaac Petsch',
      },
      title: {
        description: 'team member title',
        defaultMessage: 'UX/UI Designer',
      },
      description: {
        description: 'team member title',
        defaultMessage: 'UX/UI design and brand building freelancer',
      },
    }),
    social: [
      {
        name: 'linkedin',
        link: 'https://www.linkedin.com/in/isaac-petsch-a0190b1b3/',
      },
      {
        name: 'email',
        link: 'mailto:isaac@notional.finance',
      },
    ],
    profpic: ipetsch,
  },
  {
    name: 'mgarrett',
    ...defineMessages({
      displayName: {
        description: 'team member name',
        defaultMessage: 'Matthew Garrett',
      },
      title: {
        description: 'team member title',
        defaultMessage: 'Frontend Architect',
      },
      description: {
        description: 'team member title',
        defaultMessage: 'Seasoned frontend engineer and crypto enthusiast',
      },
    }),
    social: [
      {
        name: 'github',
        link: 'https://github.com/matthew-garrett',
      },
      {
        name: 'linkedin',
        link: 'https://www.linkedin.com/in/matthewdtotheg/',
      },
      {
        name: 'twitter',
        link: 'https://twitter.com/MatthewDtotheG',
      },
    ],
    profpic: mgarrett,
  },
];
