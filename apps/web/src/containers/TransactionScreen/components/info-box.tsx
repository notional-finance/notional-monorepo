import { Box, styled, Tabs, Tab, Divider, useTheme } from '@mui/material';
import { Caption, H5 } from '@notional-finance/mui';
import { useState, ReactNode } from 'react';

// Types for the component props
export interface TabItem {
  label: string;
  content: ReactNode | string;
}

interface InfoBoxProps {
  tabs: {
    tabTitle: string;
    contents: {
      sectionTitle: string;
      items: TabItem[];
    }[];
  }[];
}

// Info Box Component
const InfoBox = ({ tabs }: InfoBoxProps) => {
  const theme = useTheme();
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
            <CustomTab key={index} label={tab.tabTitle} />
          ))}
        </CustomTabs>
      </TabsContainer>

      <ContentContainer>
        {tabs[selectedTab]?.contents.map((content, index, array) => (
          <>
            <H5
              marginBottom={1.5}
              sx={{
                color: theme.palette.typography.main,
              }}
            >
              {content.sectionTitle}
            </H5>
            <Box gap={1.5} display="flex" flexDirection="column">
              {content.items.map((item) => (
                <Box
                  display="flex"
                  justifyContent="space-between"
                  flexDirection="row"
                >
                  <Caption color="typography.light">{item.label}</Caption>
                  <Box>
                    {typeof item.content === 'string' ? (
                      <Caption
                        color="typography.main"
                        sx={{
                          color: theme.palette.typography.main,
                        }}
                      >
                        {item.content}
                      </Caption>
                    ) : (
                      item.content
                    )}
                  </Box>
                </Box>
              ))}
            </Box>
            {index !== array.length - 1 && (
              <Divider sx={{ margin: '12px 0' }} />
            )}
          </>
        ))}
      </ContentContainer>
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

export default InfoBox;
