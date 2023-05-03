import { ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';

interface DataSets {
  title: ReactNode;
  bodyText: ReactNode;
  actionItems: ReactNode[];
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
        <FormattedMessage defaultMessage={'Deposit'} />,
        <FormattedMessage defaultMessage={'Earn Interest'} />,
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
        <FormattedMessage defaultMessage={'Deposit'} />,
        <FormattedMessage defaultMessage={'Earn Interest'} />,
        <FormattedMessage defaultMessage={'Earn Fees and incentives'} />,
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
        <FormattedMessage defaultMessage={'Borrow'} />,
        <FormattedMessage defaultMessage={'Pay Interest'} />,
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
        <FormattedMessage defaultMessage={'Borrow'} />,
        <FormattedMessage defaultMessage={'Earn Vault Yield'} />,
        <FormattedMessage defaultMessage={'Pay Interest'} />,
      ],
    },
  ];

  return { leftDataSet, rightDataSet };
};

export default useHowItWorks;
