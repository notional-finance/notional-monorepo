'use client';

import { lazy } from 'react';
import { usePathname } from 'next/navigation';

// project-import
import { SimpleLayoutType } from 'config';

const Header = lazy(() => import('./Header'));
const FooterBlock = lazy(() => import('./FooterBlock'));

// ==============================|| LAYOUTS - STRUCTURE ||============================== //

interface Props {
  children: React.ReactNode;
}

export default function Layout({ children }: Props) {
  const pathname = usePathname();
  const layout: string = pathname === 'landing' || pathname === '/' ? SimpleLayoutType.LANDING : SimpleLayoutType.SIMPLE;

  return (
    <>
      <Header />
      {children}
      <FooterBlock isFull={layout === SimpleLayoutType.LANDING} />
    </>
  );
}
