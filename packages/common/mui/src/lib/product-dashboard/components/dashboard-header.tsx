import { Box, styled, useTheme } from '@mui/material';
import { SimpleToggle } from '../../simple-toggle/simple-toggle';
import { FourSquareIcon, ListIcon } from '@notional-finance/icons';
import { FormattedMessage } from 'react-intl';
import { DashboardHeaderProps } from '../product-dashboard';
import { MessageBox } from '../../message-box/message-box';
import { NetworkToggle } from '../../network-toggle/network-toggle';

export const DashboardHeader = ({
  headerData,
  tokenGroup,
  handleTokenGroup,
  dashboardTab,
  handleDashboardTab,
}: DashboardHeaderProps) => {
  const theme = useTheme();
  const { messageBoxText, networkToggle, handleNetWorkToggle } = headerData;

  const gridToggleData = [
    <Box
      key={0}
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
      key={1}
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

  const tokenGroupData = [
    <Box
      key={0}
      sx={{
        display: 'flex',
        whiteSpace: 'nowrap',
        fontSize: '14px',
      }}
    >
      <FormattedMessage defaultMessage="All" />
    </Box>,
    <Box
      key={1}
      sx={{
        display: 'flex',
        whiteSpace: 'nowrap',
        fontSize: '14px',
      }}
    >
      <FormattedMessage defaultMessage="Stablecoins" />
    </Box>,
    <Box
      key={2}
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
    <HeaderContainer>
      <Box sx={{ display: 'flex' }}>
        <Box sx={{ marginRight: theme.spacing(3) }}>
          <NetworkToggle
            selectedNetwork={networkToggle}
            handleNetWorkToggle={handleNetWorkToggle}
          />
        </Box>
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
  );
};

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

const GridListToggleWrapper = styled(Box)(
  ({ theme }) => `
  ${theme.breakpoints.down('sm')} {
    display: none;
  }
`
);

export default DashboardHeader;
