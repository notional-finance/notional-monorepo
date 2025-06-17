import { Box, styled, Tabs, Tab, Fade } from '@mui/material';
import { ScrollableIcon } from '@notional-finance/icons';
import { useState, ReactNode, useRef, useEffect } from 'react';

interface InfoBoxProps {
  tabs: {
    tabTitle: string;
    tabContent: ReactNode;
  }[];
}

const InfoBox = ({ tabs }: InfoBoxProps) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [isScrollable, setIsScrollable] = useState(false);
  const [isAtBottomOfScroll, setIsAtBottomOfScroll] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const checkIfScrollable = () => {
    if (contentRef.current) {
      const { scrollHeight, clientHeight } = contentRef.current;
      const isScrollableContent = scrollHeight - 10 > clientHeight;
      setIsScrollable(isScrollableContent);
    }
  };

  const handleScroll = () => {
    if (contentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      // Show indicator if not at bottom (with a small threshold)
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 10;
      setIsAtBottomOfScroll(isAtBottom);
    }
  };

  useEffect(() => {
    checkIfScrollable();
    setIsAtBottomOfScroll(false);
    const contentElement = contentRef.current;

    if (contentElement) {
      contentElement.addEventListener('scroll', handleScroll);
      const resizeObserver = new ResizeObserver(checkIfScrollable);
      resizeObserver.observe(contentElement);

      return () => {
        contentElement.removeEventListener('scroll', handleScroll);
        resizeObserver.disconnect();
      };
    }
  }, [selectedTab]); // Re-check when tab changes

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
            <CustomTab disableRipple key={index} label={tab.tabTitle} />
          ))}
        </CustomTabs>
      </TabsContainer>

      <ContentContainer ref={contentRef}>
        {tabs[selectedTab]?.tabContent}
      </ContentContainer>
      <Fade in={isScrollable && !isAtBottomOfScroll} timeout={200}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ScrollableIcon />
        </Box>
      </Fade>
    </InfoBoxContainer>
  );
};

const InfoBoxContainer = styled(Box)(
  ({ theme }) => `
  background-color: ${theme.palette.common.white};
  padding: ${theme.spacing(3)};
  border-radius: ${theme.shape.borderRadius()};
  border: 1px solid ${theme.palette.borders.paper};
  display: flex;
  flex-direction: column;
  width: 100%;
  flex: 1;
`
);

const TabsContainer = styled(Box)(
  ({ theme }) => `
  margin-bottom: ${theme.spacing(2)};
  border-bottom: 1px solid ${theme.palette.borders.paper};
`
);

const CustomTabs = styled(Tabs)(
  ({ theme }) => `
  min-height: 0;
  & .MuiTabs-flexContainer {
    gap: ${theme.spacing(3)};
    margin-bottom: ${theme.spacing(1)};
    justify-content: space-around;
  }
  & .MuiTabs-indicator {
    background-color: ${theme.palette.primary.light};
    height: 2px;
  }
`
);

const CustomTab = styled(Tab)(
  ({ theme }) => `
  font-size: ${theme.typography.body1.fontSize};
  font-weight: ${theme.typography.body1.fontWeight};
  color: ${theme.typography.body1.color};
  line-height: ${theme.typography.body1.lineHeight};
  padding: ${theme.spacing(0, 2)};
  align-items: flex-start;
  min-width: unset;
  max-width: fit-content;
  min-height: 0;
  text-wrap: unset;
  &.Mui-selected {
    color: ${theme.palette.typography.main};
    font-weight: 600;
  }
`
);

const ContentContainer = styled(Box)`
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  padding-bottom: ${({ theme }) => theme.spacing(2)};
`;

export default InfoBox;
