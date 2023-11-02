import { ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';
import { useLocation } from 'react-router-dom';

export interface CardSubNavProps {
  to: string;
  title: ReactNode;
}

export const useCardSubNav = () => {
  const { pathname } = useLocation();
  const links: CardSubNavProps[] = pathname.includes('borrow')
    ? [
        {
          title: <FormattedMessage defaultMessage={'Fixed Rate Borrowing'} />,
          to: '/borrow-fixed',
        },
        {
          title: (
            <FormattedMessage defaultMessage={'Variable Rate Borrowing'} />
          ),
          to: '/borrow-variable',
        },
      ]
    : [
        {
          title: <FormattedMessage defaultMessage={'Fixed Rate Lending'} />,
          to: '/lend-fixed',
        },
        {
          title: <FormattedMessage defaultMessage={'Variable Rate Lending'} />,
          to: '/lend-variable',
        },
        {
          title: <FormattedMessage defaultMessage={'Provide Liquidity'} />,
          to: '/liquidity-variable',
        },
      ];

  const leveragedLinks: CardSubNavProps[] = [
    {
      title: <FormattedMessage defaultMessage={'Leveraged Vaults'} />,
      to: '/vaults',
    },
    // {
    //   title: <FormattedMessage defaultMessage={'Leveraged Lending'} />,
    //   to: '/lend-leveraged',
    // },
    {
      title: <FormattedMessage defaultMessage={'Leveraged Liquidity'} />,
      to: '/liquidity-leveraged',
    },
  ];
  return { links, leveragedLinks };
};

export default useCardSubNav;
