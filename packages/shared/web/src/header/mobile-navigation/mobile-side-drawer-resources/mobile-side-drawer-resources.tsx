import { Box, BoxProps, Typography, useTheme } from '@mui/material';
import { useResourceLinks } from '../use-side-drawer-links';
import MobileNavTab from '../mobile-nav-tab/mobile-nav-tab';
import { styled } from '@mui/material/styles';

const MobileSideDrawerResources = () => {
  const theme = useTheme();
  const { learn, governance, community } = useResourceLinks();

  interface StyledBoxProps extends BoxProps {
    borderLeftColor: string;
    backgroundColor: string;
    zIndex: string;
  }
  const StyledBox = styled(Box)(
    ({ borderLeftColor, backgroundColor, zIndex }: StyledBoxProps) => `
      display: flex;
      flex-direction: column;
      border-left: 6px solid ${borderLeftColor};
      background: ${backgroundColor};
      box-shadow: 0px 0px 6px rgb(25 19 102 / 11%);
      z-index: ${zIndex};
      `
  );

  return (
    <>
      {learn.title && (
        <StyledBox
          // NOTE* The border colors are intentionally hardcoded here
          borderLeftColor="#1F9B99"
          backgroundColor={theme.palette.background.default}
          zIndex="3"
        >
          <Typography
            sx={{
              width: '90%',
              margin: 'auto',
              marginTop: '50px',
              fontWeight: '700',
            }}
          >
            {learn.title}
          </Typography>
          {learn.data.map((data) => (
            <MobileNavTab key={data.key} data={data} />
          ))}
        </StyledBox>
      )}
      {governance.title && (
        <StyledBox
          borderLeftColor="#2DE1E8"
          backgroundColor={theme.palette.background.paper}
          zIndex="2"
        >
          <Typography
            sx={{
              width: '90%',
              margin: 'auto',
              marginTop: '50px',
              fontWeight: '700',
            }}
          >
            {governance.title}
          </Typography>
          {governance.data.map((data) => (
            <MobileNavTab key={data.key} data={data} />
          ))}
        </StyledBox>
      )}
      {community.title && (
        <StyledBox
          borderLeftColor="#8F9BB3"
          backgroundColor={theme.palette.background.default}
          zIndex="1"
        >
          <Typography
            sx={{
              width: '90%',
              margin: 'auto',
              marginTop: '50px',
              fontWeight: '700',
            }}
          >
            {community.title}
          </Typography>
          {community.data.map((data) => (
            <MobileNavTab key={data.key} data={data} />
          ))}
        </StyledBox>
      )}
    </>
  );
};

export default MobileSideDrawerResources;
