import { ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';
import GreenArrowLeft from './images/green-arrow-left.svg';
import GreenArrowRight from './images/green-arrow-right.svg';
import TurgArrowRight from './images/turq-arrow-right.svg';
import TurgArrowLeft from './images/turq-arrow-left.svg';
import Plus from './images/plus.svg';

export interface DataSets {
  title: ReactNode;
  hoverTitle: ReactNode;
  bodyText: ReactNode;
  actionItems: {
    itemText: ReactNode;
    icon: string;
  }[];
  linkData: {
    linkText: ReactNode;
    link: string;
  }[];
}

interface HowItWorks {
  leftDataSet: DataSets[];
  rightDataSet: DataSets[];
}

export const useHowItWorks = (): HowItWorks => {
  const leftDataSet = [
    {
      title: <FormattedMessage defaultMessage={'Lend'} />,
      bodyText: (
        <FormattedMessage defaultMessage={'Deposit assets to earn interest.'} />
      ),
      actionItems: [
        {
          itemText: <FormattedMessage defaultMessage={'Deposit'} />,
          icon: GreenArrowRight,
        },
        {
          itemText: <FormattedMessage defaultMessage={'Earn Interest'} />,
          icon: TurgArrowLeft,
        },
      ],
      hoverTitle: <FormattedMessage defaultMessage={'Lending'} />,
      linkData: [
        {
          linkText: (
            <FormattedMessage defaultMessage={'View All Fixed Rates'} />
          ),
          link: '/lend',
        },
      ],
    },
    {
      title: <FormattedMessage defaultMessage={'Liquidity Providers'} />,
      bodyText: (
        <FormattedMessage
          defaultMessage={
            'Deposit assets to make markets for fixed rate lenders and borrowers. Earn interest, fees, and incentives.'
          }
        />
      ),
      actionItems: [
        {
          itemText: <FormattedMessage defaultMessage={'Deposit'} />,
          icon: GreenArrowRight,
        },
        {
          itemText: <FormattedMessage defaultMessage={'Earn Interest'} />,
          icon: TurgArrowLeft,
        },
        {
          itemText: (
            <FormattedMessage defaultMessage={'Earn Fees and incentives'} />
          ),
          icon: TurgArrowLeft,
        },
      ],
      hoverTitle: <FormattedMessage defaultMessage={'Provide Liquidity'} />,
      linkData: [
        {
          linkText: <FormattedMessage defaultMessage={'View Opportunities'} />,
          link: '/provide',
        },
      ],
    },
  ];
  const rightDataSet = [
    {
      title: <FormattedMessage defaultMessage={'Borrowers'} />,
      bodyText: (
        <FormattedMessage
          defaultMessage={
            'Deposit collateral to borrow crypto and pay interest.'
          }
        />
      ),
      actionItems: [
        {
          itemText: <FormattedMessage defaultMessage={'Borrow'} />,
          icon: TurgArrowRight,
        },
        {
          itemText: <FormattedMessage defaultMessage={'Pay Interest'} />,
          icon: GreenArrowLeft,
        },
      ],
      hoverTitle: <FormattedMessage defaultMessage={'Borrowing'} />,
      linkData: [
        {
          linkText: (
            <FormattedMessage defaultMessage={'View All Fixed Rates'} />
          ),
          link: '/borrow',
        },
      ],
    },
    {
      title: <FormattedMessage defaultMessage={'Leveraged Vault Users'} />,
      bodyText: (
        <FormattedMessage
          defaultMessage={
            'Borrow crypto to deposit into DeFi yield strategies. Pay interest to Notional.'
          }
        />
      ),
      actionItems: [
        {
          itemText: <FormattedMessage defaultMessage={'Borrow'} />,
          icon: TurgArrowRight,
        },
        {
          itemText: <FormattedMessage defaultMessage={'Earn Vault Yield'} />,
          icon: Plus,
        },
        {
          itemText: <FormattedMessage defaultMessage={'Pay Interest'} />,
          icon: GreenArrowLeft,
        },
      ],
      hoverTitle: <FormattedMessage defaultMessage={'Leveraged Vaults'} />,
      linkData: [
        {
          linkText: (
            <FormattedMessage defaultMessage={'View Available Vaults'} />
          ),
          link: '/vaults',
        },
      ],
    },
  ];

  return { leftDataSet, rightDataSet };
};

export default useHowItWorks;
