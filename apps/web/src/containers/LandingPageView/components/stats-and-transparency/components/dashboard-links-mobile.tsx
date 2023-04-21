// import { FormattedMessage } from 'react-intl';
import { useTheme, Box, styled } from '@mui/material';
import { useDashboardLinks } from '../use-dashboard-links';
import { Caption } from '@notional-finance/mui';
import { NotionalTheme, colors } from '@notional-finance/styles';
// import { ArrowRightIcon } from '@notional-finance/icons';

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
        <Test
          fadeActive={currentImageIndex === index}
          theme={theme}
          onClick={() => handleImageHover(index, true)}
          key={index}
        >
          {title}
        </Test>
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
  ${theme.breakpoints.down(1000)} {
    display: flex;
    margin-bottom: ${theme.spacing(8)};
   }
   ${theme.breakpoints.down('sm')} {
    overflow-x: scroll;
  }
`
);

// const LinkWrapper = styled(Box, {
//   shouldForwardProp: (prop: string) => prop !== 'fadeActive',
// })(
//   ({ fadeActive, theme }: FadeBoxProps) => `
//   transition: all 1s ease;
//   border-color: ${fadeActive ? colors.white : 'transparent'};
//   border-style: solid;
//   border-width: 1px 0px 1px 1px;
//   border-radius: 8px 0px 0px 8px;
//   margin-right: -4px;
//   cursor: pointer;
//   ${theme.breakpoints.down(1220)} {
//     margin-right: -25px;
//   }
// `
// );

// const ViewDashboard = styled(SmallInput, {
//   shouldForwardProp: (prop: string) => prop !== 'fadeActive',
// })(
//   ({ fadeActive }: FadeBoxProps) => `
//   transition: opacity 1s ease;
//   color: ${colors.white};
//   opacity: ${fadeActive ? '1' : '0'};
// `
// );

const Test = styled(Caption, {
  shouldForwardProp: (prop: string) => prop !== 'fadeActive',
})(
  ({ fadeActive, theme }: FadeBoxProps) => `
  cursor: pointer;
  font-weight: 500;
  color: ${fadeActive ? colors.black : colors.white};
  margin-right: ${theme.spacing(2)};
  white-space: nowrap;
  background: ${fadeActive ? colors.white : 'transparent'};
  padding: 8px 12px;
  border-radius: 25px;
`
);

export default DashboardLinksMobile;
