import { defineMessages } from 'react-intl';
import { IconCell } from '@notional-finance/mui';



// This is a millisecond timestamp for 12 AM on 02/01/2024
export const contestStartDate = 1706832000000;

export const startDate = 'Feb 5th 12:00 am PST';
export const endDate = 'Mar 5th 12:00 am PST';


export const messages = {
  ContestHero: defineMessages({
    bodyText: {
      defaultMessage: 'Contest runs Feb. 1st to Mar. 1st. Open to everyone and free to join. Click below to enter and compete for 27k $NOTE in prizes!',
      description: 'body text',
    },
  }),
  ContestPartners: defineMessages({
    bodyText: {
      defaultMessage: 'The following 3 communities have the chance to earn special prizes in addition to the grand prizes open to everyone. The top high roller and fat cat from each community will each win 4,000 $NOTE!',
      description: 'body text',
    },
  }),
};

export const partnersTableColumns = [
    {
      Header: 'Community',
      Cell: IconCell,
      accessor: 'community',
      textAlign: 'left',
      fontSize: '20px',
    },
    {
      Header: 'High roller prize',
      accessor: 'hrPrize',
      textAlign: 'right',
      fontSize: '16px',
    },
    {
      Header: 'Fat cat prize',
      accessor: 'fcPrize',
      textAlign: 'right',
      fontSize: '16px',
    },
  ];

  export const partnersTableData = [
    {
      community: 'Layer2DAO',
      hrPrize: '4,000 NOTE',
      fcPrize: '4,000 NOTE',
    },
    {
      community: 'Llamas',
      hrPrize: '4,000 NOTE',
      fcPrize: '4,000 NOTE',
    },
    {
      community: 'Cryptotesters',
      hrPrize: '4,000 NOTE',
      fcPrize: '4,000 NOTE',
    },
  ];

  export const prizeData = [
    {
        title: '1st Place',
        value: '10,000 NOTE',
    },
    {
        title: '2nd Place',
        value: '2,500 NOTE',
    },
    {
        title: '3rd Place',
        value: '1,000 NOTE',
    }
  ]
