import { FormattedMessage } from 'react-intl';
import { useTheme, Box, styled } from '@mui/material';
import { useDashboardLinks } from '../use-dashboard-links';
import { ExternalLink, BodySecondary, SmallInput } from '@notional-finance/mui';
import { NotionalTheme, colors } from '@notional-finance/styles';
import { ArrowRightIcon } from '@notional-finance/icons';

interface FadeBoxProps {
  fadeActive: boolean;
  theme: NotionalTheme;
}

interface DashboardLinksProps {
  currentImageIndex: number;
  handleImageHover: (index: number, isHovered: boolean) => void;
}

export const DashboardLinks = ({
  currentImageIndex,
  handleImageHover,
}: DashboardLinksProps) => {
  const theme = useTheme();
  const dashboardLinks = useDashboardLinks();

  return (
    <LinksContainer>
      {dashboardLinks.map(({ link, title, icon }, index) => (
        <LinkWrapper
          key={index}
          fadeActive={currentImageIndex === index}
          theme={theme}
          onMouseEnter={() => handleImageHover(index, true)}
          onMouseLeave={() => handleImageHover(index, false)}
        >
          <ExternalLink
            href={link}
            style={{
              padding: theme.spacing(3),
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingRight: '8px',
            }}
          >
            <BodyText>
              <Box
                component={'span'}
                sx={{
                  marginRight: theme.spacing(3),
                  display: 'flex',
                }}
              >
                {icon}
              </Box>
              {title}
            </BodyText>
            <ViewDashboard
              fadeActive={currentImageIndex === index}
              theme={theme}
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              <FormattedMessage defaultMessage={'View Dashboard'} />
              <ArrowRightIcon
                fill="white"
                sx={{ height: '14px', marginLeft: theme.spacing(2) }}
              />
            </ViewDashboard>
          </ExternalLink>
        </LinkWrapper>
      ))}
    </LinksContainer>
  );
};

const LinksContainer = styled(Box)(
  ({ theme }) => `
  width: 40%;
  display: flex;
  flex-direction: column;
  margin-top: ${theme.spacing(12.5)};
  ${theme.breakpoints.down('smLanding')} {
   display: none;
  }
`
);

const LinkWrapper = styled(Box, {
  shouldForwardProp: (prop: string) => prop !== 'fadeActive',
})(
  ({ fadeActive, theme }: FadeBoxProps) => `
  transition: all 1s ease;
  border-color: ${fadeActive ? colors.white : 'transparent'};
  border-style: solid;
  border-width: 1px 0px 1px 1px;
  border-radius: 8px 0px 0px 8px;
  margin-right: -4px;
  cursor: pointer;
  ${theme.breakpoints.down('mdLanding')} {
    margin-right: -25px;
  }
`
);

const ViewDashboard = styled(SmallInput, {
  shouldForwardProp: (prop: string) => prop !== 'fadeActive',
})(
  ({ fadeActive }: FadeBoxProps) => `
  transition: opacity 1s ease;
  color: ${colors.white};
  opacity: ${fadeActive ? '1' : '0'};
`
);

const BodyText = styled(BodySecondary)(`
  font-weight: 600;
  color: ${colors.black};
  display: flex;
  align-items: center;
  white-space: nowrap;
`);

export default DashboardLinks;
