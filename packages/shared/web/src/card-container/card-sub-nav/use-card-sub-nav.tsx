import { ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';

export interface CardSubNavProps {
  to: string;
  title: ReactNode;
}

export const useCardSubNav = () => {
  const links: CardSubNavProps[] = [
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
    {
      title: <FormattedMessage defaultMessage={'Leveraged Lending'} />,
      to: '/lend-leveraged',
    },
    {
      title: <FormattedMessage defaultMessage={'Leveraged Liquidity'} />,
      to: '/liquidity-leveraged',
    },
  ];
  return { links, leveragedLinks };
};

export default useCardSubNav;
