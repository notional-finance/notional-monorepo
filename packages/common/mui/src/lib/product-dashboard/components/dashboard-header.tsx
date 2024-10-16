import { alpha, Box, styled, useTheme } from '@mui/material';
import { SimpleToggle } from '../../simple-toggle/simple-toggle';
import {
  AutoReinvestIcon,
  DirectIcon,
  FourSquareIcon,
  ListIcon,
} from '@notional-finance/icons';
import { FormattedMessage } from 'react-intl';
import { DashboardHeaderProps } from '../product-dashboard';
import { MessageBox } from '../../message-box/message-box';
import { NetworkToggle } from '../../network-toggle/network-toggle';
import { PRODUCTS } from '@notional-finance/util';

export const DashboardHeader = ({
  headerData,
  reinvestmentType,
  handleReinvestmentType,
  tokenGroup,
  handleTokenGroup,
  dashboardTab,
  handleDashboardTab,
  disabled,
}: DashboardHeaderProps) => {
  const theme = useTheme();
  const { messageBoxText, networkToggle, handleNetworkToggle } = headerData;

  const gridToggleData = [
    <Box
      sx={{
        fontSize: '14px',
        display: 'flex',
        svg: {
          height: theme.spacing(2),
          width: theme.spacing(2),
          marginRight: theme.spacing(1),
        },
      }}
    >
      <FourSquareIcon />
      <FormattedMessage defaultMessage="Grid" />
    </Box>,
    <Box
      sx={{
        fontSize: '14px',
        display: 'flex',
        svg: {
          height: theme.spacing(2),
          width: theme.spacing(2),
          marginRight: theme.spacing(1),
        },
      }}
    >
      <ListIcon />
      <FormattedMessage defaultMessage="List" />
    </Box>,
  ];

  const vaultToggleData = [
    <Box
      sx={{
        display: 'flex',
        whiteSpace: 'nowrap',
        fontSize: '14px',
      }}
    >
      <FormattedMessage defaultMessage="All" />
    </Box>,
    <Box
      sx={{
        fontSize: '14px',
        display: 'flex',
        whiteSpace: 'nowrap',
        svg: {
          height: theme.spacing(2),
          width: theme.spacing(2),
          marginRight: theme.spacing(1),
        },
      }}
    >
      <AutoReinvestIcon />
      <FormattedMessage defaultMessage="Auto Reinvest" />
    </Box>,
    <Box
      sx={{
        fontSize: '14px',
        display: 'flex',
        whiteSpace: 'nowrap',
        svg: {
          height: theme.spacing(2),
          width: theme.spacing(2),
          marginRight: theme.spacing(1),
        },
      }}
    >
      <DirectIcon className="stroke-icon" />
      <FormattedMessage defaultMessage="Direct Claim" />
    </Box>,
  ];

  const tokenGroupData = [
    <Box
      sx={{
        display: 'flex',
        whiteSpace: 'nowrap',
        fontSize: '14px',
      }}
    >
      <FormattedMessage defaultMessage="All" />
    </Box>,
    <Box
      sx={{
        display: 'flex',
        whiteSpace: 'nowrap',
        fontSize: '14px',
      }}
    >
      <FormattedMessage defaultMessage="Stablecoins" />
    </Box>,
    <Box
      sx={{
        display: 'flex',
        whiteSpace: 'nowrap',
        fontSize: '14px',
      }}
    >
      ETH + LSDs
    </Box>,
  ];

  return (
    <HeaderContainerWrapper>
      <HeaderContainer>
        <Box sx={{ display: 'flex' }}>
          <Box sx={{ marginRight: theme.spacing(3) }}>
            <NetworkToggle
              selectedNetwork={networkToggle}
              handleNetworkToggle={handleNetworkToggle}
            />
          </Box>
          {headerData.product === PRODUCTS.LEVERAGED_YIELD_FARMING && (
            <GridListToggleWrapper sx={{ marginRight: theme.spacing(3) }}>
              <SimpleToggle
                tabVariant="standard"
                tabLabels={vaultToggleData}
                selectedTabIndex={reinvestmentType}
                onChange={(_, v) => handleReinvestmentType(v as number)}
              />
            </GridListToggleWrapper>
          )}
          {dashboardTab === 1 && (
            <SimpleToggle
              tabVariant="standard"
              tabLabels={tokenGroupData}
              selectedTabIndex={tokenGroup}
              onChange={(_, v) => handleTokenGroup(v as number)}
            />
          )}
        </Box>
        <Box sx={{ display: 'flex' }}>
          {messageBoxText && (
            <MessageBox sx={{ marginRight: theme.spacing(3) }}>
              {messageBoxText}
            </MessageBox>
          )}
          <GridListToggleWrapper>
            <SimpleToggle
              tabLabels={gridToggleData}
              selectedTabIndex={dashboardTab}
              onChange={(_, v) => handleDashboardTab(v as number)}
            />
          </GridListToggleWrapper>
        </Box>
      </HeaderContainer>
      {disabled && <DisabledOverlay />}
    </HeaderContainerWrapper>
  );
};

const HeaderContainerWrapper = styled(Box)`
  position: relative;
`;

const HeaderContainer = styled(Box)(
  ({ theme }) => `
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: ${theme.shape.borderStandard};
    padding: ${theme.spacing(3)};
    ${theme.breakpoints.down('sm')} {
      padding: ${theme.spacing(2)};
      flex-direction: column;  
      align-items: start;
    }

          `
);

const DisabledOverlay = styled(Box)(
  ({ theme }) => `
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: ${alpha(theme.palette.common.white, 0.5)};
    pointer-events: all;
    border-top-left-radius: ${theme.shape.borderRadiusLarge};
    border-top-right-radius: ${theme.shape.borderRadiusLarge};
    z-index: 3;
  `
);

const GridListToggleWrapper = styled(Box)(
  ({ theme }) => `
  ${theme.breakpoints.down('sm')} {
    display: none;
  }
`
);

export default DashboardHeader;
