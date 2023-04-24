import { useTheme, Box, styled } from '@mui/material';
import { useDashboardLinks } from '../use-dashboard-links';
import { Caption } from '@notional-finance/mui';
import { NotionalTheme, colors } from '@notional-finance/styles';

interface FadeBoxProps {
  fadeActive: boolean;
  theme: NotionalTheme;
}

interface DashboardLinksProps {
  currentImageIndex: number;
  handleImageHover: (index: number, isHovered: boolean) => void;
}

export const DashboardLinksMobile = ({
  currentImageIndex,
  handleImageHover,
}: DashboardLinksProps) => {
  const theme = useTheme();
  const dashboardLinks = useDashboardLinks();

  return (
    <LinksContainer>
      {dashboardLinks.map(({ title }, index) => (
        <TitleButton
          fadeActive={currentImageIndex === index}
          theme={theme}
          onClick={() => handleImageHover(index, true)}
          key={index}
        >
          {title}
        </TitleButton>
      ))}
    </LinksContainer>
  );
};

const LinksContainer = styled(Box)(
  ({ theme }) => `
  display: none;
  ${theme.breakpoints.down(1000)} {
   display: flex;
   margin-bottom: ${theme.spacing(8)};
  }
   ${theme.breakpoints.down('sm')} {
    overflow-x: scroll;
    margin-bottom: ${theme.spacing(4)};
    padding-bottom: ${theme.spacing(2)};
  }
`
);

const TitleButton = styled(Caption, {
  shouldForwardProp: (prop: string) => prop !== 'fadeActive',
})(
  ({ fadeActive, theme }: FadeBoxProps) => `
  -webkit-tap-highlight-color: transparent;
  cursor: pointer;
  font-weight: 500;
  color: ${fadeActive ? colors.black : colors.white};
  margin-right: ${theme.spacing(2)};
  white-space: nowrap;
  background: ${fadeActive ? colors.white : 'transparent'};
  padding: ${theme.spacing(1, 1.5)};
  border-radius: 25px;
`
);

export default DashboardLinksMobile;
