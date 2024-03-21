import { Box, styled, useTheme } from '@mui/material';
import { SimpleToggle } from '../../simple-toggle/simple-toggle';
import { FourSquareIcon, ListIcon } from '@notional-finance/icons';
import { FormattedMessage } from 'react-intl';
import { DashboardHeaderProps } from '../product-dashboard';

export const DashboardHeader = ({
  headerData,
  tokenGroup,
  handleTokenGroup,
  dashboardTab,
  handleDashboardTab,
}: DashboardHeaderProps) => {
  const theme = useTheme();
  const { toggleOptions, messageBoxText, networkToggle, handleNetWorkToggle } =
    headerData;

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
    <HeaderContainer>
      <Box sx={{ display: 'flex' }}>
        <Box sx={{ marginRight: theme.spacing(3) }}>
          <SimpleToggle
            tabLabels={toggleOptions}
            selectedTabIndex={networkToggle}
            onChange={(_, v) => handleNetWorkToggle(v as number)}
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
        {messageBoxText && <MessageBox>{messageBoxText}</MessageBox>}
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
const MessageBox = styled(Box)(
  ({ theme }) => `
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: 14px;
  color: ${theme.palette.typography.light};
  background: ${theme.palette.background.default};
  padding: ${theme.spacing(1.5, 2)};
  border-radius: ${theme.shape.borderRadius()};
  margin-right: ${theme.spacing(3)};
  ${theme.breakpoints.down('md')} {
    display: none;
  }
          `
);

export default DashboardHeader;
