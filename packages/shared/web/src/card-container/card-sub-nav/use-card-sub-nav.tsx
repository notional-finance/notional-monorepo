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
      to: '/lend',
    },
    {
      title: <FormattedMessage defaultMessage={'Leveraged Vaults'} />,
      to: '/vaults',
    },
    {
      title: <FormattedMessage defaultMessage={'Provide Liquidity'} />,
      to: '/provide',
    },
  ];
  return { links };
};

export default useCardSubNav;
