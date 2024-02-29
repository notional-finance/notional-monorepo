import { Box, styled, useTheme } from '@mui/material';
import { SimpleToggle } from '../../simple-toggle/simple-toggle';
import { FourSquareIcon, ListIcon } from '@notional-finance/icons';
import { MessageDescriptor, FormattedMessage } from 'react-intl';

export interface DashboardHeaderProps {
  headerData: {
    toggleOptions: React.ReactNode[];
    messageBoxText?: MessageDescriptor;
  };
  dashboardTab: number;
  setDashboardTab: any;
  tokenGroup: number;
  setTokenGroup: any;
}

const gridToggleData = [
  <Box
    sx={{
      fontSize: '14px',
      display: 'flex',
      svg: { height: '16px', width: '16px', marginRight: '8px' },
    }}
  >
    <FourSquareIcon />
    <FormattedMessage defaultMessage="Grid" />
  </Box>,
  <Box
    sx={{
      fontSize: '14px',
      display: 'flex',
      svg: { height: '16px', width: '16px', marginRight: '8px' },
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

export const DashboardHeader = ({
  headerData,
  tokenGroup,
  setTokenGroup,
  dashboardTab,
  setDashboardTab,
}: DashboardHeaderProps) => {
  const theme = useTheme();
  const { toggleOptions, messageBoxText } = headerData;

  return (
    <HeaderContainer>
      <Box sx={{ display: 'flex' }}>
        <Box sx={{ marginRight: theme.spacing(3) }}>
          <SimpleToggle
            tabLabels={toggleOptions}
            selectedTabIndex={0}
            toggleStyle={'accent'}
          />
        </Box>
        {dashboardTab === 1 && (
          <SimpleToggle
            tabVariant="standard"
            toggleStyle={'accent'}
            tabLabels={tokenGroupData}
            selectedTabIndex={tokenGroup}
            onChange={(_, v) => setTokenGroup(v as number)}
          />
        )}
      </Box>
      <Box sx={{ display: 'flex' }}>
        {messageBoxText && <MessageBox>{messageBoxText}</MessageBox>}
        <Test>
          <SimpleToggle
            tabLabels={gridToggleData}
            selectedTabIndex={dashboardTab}
            onChange={(_, v) => setDashboardTab(v as number)}
          />
        </Test>
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

const Test = styled(Box)(
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
