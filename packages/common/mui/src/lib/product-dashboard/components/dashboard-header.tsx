import { Box, styled } from '@mui/material';
import { SimpleToggle } from '../../simple-toggle/simple-toggle';
import { MessageDescriptor } from 'react-intl';

export interface DashboardHeaderProps {
  headerData: {
    toggleOptions: React.ReactNode[];
    messageBoxText: MessageDescriptor;
  };
}

export const DashboardHeader = ({ headerData }: DashboardHeaderProps) => {
  const { toggleOptions, messageBoxText } = headerData;
  return (
    <HeaderContainer>
      <SimpleToggle tabLabels={toggleOptions} selectedTabIndex={0} />
      <MessageBox>{messageBoxText}</MessageBox>
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
  ${theme.breakpoints.down('sm')} {
    display: none;
  }
          `
);

export default DashboardHeader;
