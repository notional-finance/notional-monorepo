import { Box, styled, Typography, Tabs, Tab } from '@mui/material';
import { useState, ReactNode } from 'react';

// Types for the component props
export interface TabItem {
  label: string;
  content: ReactNode;
}

interface InfoBoxProps {
  tabs: TabItem[];
}

// Info Box Component
const InfoBox = ({ tabs }: InfoBoxProps) => {
  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  return (
    <InfoBoxContainer>
      <TabsContainer>
        <CustomTabs
          value={selectedTab}
          onChange={handleTabChange}
          variant="fullWidth"
        >
          {tabs.map((tab, index) => (
            <CustomTab key={index} label={tab.label} />
          ))}
        </CustomTabs>
      </TabsContainer>

      <ContentContainer>{tabs[selectedTab]?.content}</ContentContainer>
    </InfoBoxContainer>
  );
};

const InfoBoxContainer = styled(Box)(
  ({ theme }) => `
  background-color: ${theme.palette.common.white};
  padding: ${theme.spacing(2.5)};
  border-radius: ${theme.shape.borderRadius()};
  border: 1px solid ${theme.palette.borders.paper};
  display: flex;
  flex-direction: column;
  width: 100%;
  flex: 1;
`
);

const TabsContainer = styled(Box)`
  margin-bottom: 15px;
  border-bottom: 1px solid ${({ theme }) => theme.palette.borders.paper};
`;

const CustomTabs = styled(Tabs)`
  min-height: 0;
  & .MuiTabs-flexContainer {
    gap: ${({ theme }) => theme.spacing(3)};
    margin-bottom: ${({ theme }) => theme.spacing(1)};
  }
`;

const CustomTab = styled(Tab)`
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.palette.typography.light};
  padding: 0;
  align-items: flex-start;
  min-width: unset;
  max-width: fit-content;
  min-height: 0;
  &.Mui-selected {
    color: ${({ theme }) => theme.palette.typography.main};
  }
`;

const ContentContainer = styled(Box)`
  flex: 1;
  overflow-y: auto;
  min-height: 0; /* Ensures scrolling works with flex parent */
`;

// Reusable components for content
export const InfoBoxContent = styled(Box)`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  padding-right: 8px;
`;

export const InfoItem = styled(Box)`
  display: flex;
  flex-direction: column;
`;

export const InfoLabel = styled(Typography)`
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
`;

export const InfoValue = styled(Typography)`
  font-size: 20px;
  font-weight: 600;
`;

export default InfoBox;
