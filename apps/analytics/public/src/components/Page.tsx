import { forwardRef, ReactNode, Ref } from 'react';

// next
import Head from 'next/head';

// material-ui
import Box, { BoxProps } from '@mui/material/Box';

// ==============================|| Page - SET TITLE & META TAGS ||============================== //

interface Props extends BoxProps {
  children: ReactNode;
  meta?: ReactNode;
  title: string;
}

function Page({ children, title = '', meta, ...other }: Props, ref: Ref<HTMLDivElement>) {
  return (
    <>
      <Head>
        <title>{`${title} | Mantis React Admin`}</title>
        {meta}
      </Head>

      <Box ref={ref} {...other}>
        {children}
      </Box>
    </>
  );
}

export default forwardRef<HTMLDivElement, Props>(Page);
