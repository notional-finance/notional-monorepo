import { useEffect, useState } from 'react';
import { Box, styled } from '@mui/material';

export const ScrollIndicator = () => {
  const [scrollTop, setScrollTop] = useState(0);

  const onScroll = () => {
    const winScroll = document.documentElement.scrollTop;
    const height =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;

    const scrolled = (winScroll / height) * 100;

    setScrollTop(scrolled);
  };

  useEffect(() => {
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <Container sx={{ width: `${scrollTop}%` }}>
      <ScrollBar></ScrollBar>
    </Container>
  );
};

const Container = styled(Box)(`
  height: 4px;
  position: sticky;
  top: 0;
  left: 0;
  z-index: 1;
  transition: width 0.3s ease;
`);
const ScrollBar = styled(Box)(
  ({ theme }) => `
  height: 4px;
  background:${theme.gradient.aqua};
  width: 100%;
    `
);

export default ScrollIndicator;
