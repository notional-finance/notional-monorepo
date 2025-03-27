import { Box, styled, useTheme, Collapse } from '@mui/material';
import { useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { Body, FaqProps, H4 } from '@notional-finance/mui';

interface FAQSectionProps {
  items: FaqProps[];
}

// FAQ Section Component
const FAQSection = ({ items }: FAQSectionProps) => {
  const theme = useTheme();
  const [expandedItems, setExpandedItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setExpandedItems((prev) =>
      prev.includes(index)
        ? prev.filter((item) => item !== index)
        : [...prev, index]
    );
  };

  // Create two separate arrays for the two columns (except for items with captions)
  type FAQItemWithIndex = { item: FaqProps; index: number };
  const leftColumnItems: FAQItemWithIndex[] = [];
  const rightColumnItems: FAQItemWithIndex[] = [];

  items.forEach((item, index) => {
    if (item.questionDescription) {
      // Items with captions go in a separate array to be handled specially
      leftColumnItems.push({ item, index });
    } else if (index % 2 === 0) {
      leftColumnItems.push({ item, index });
    } else {
      rightColumnItems.push({ item, index });
    }
  });

  const renderFAQItem = (itemWithIndex: FAQItemWithIndex) => {
    const { item, index } = itemWithIndex;
    const isExpanded = expandedItems.includes(index);
    return (
      <FAQItemBox
        key={index}
        sx={item.questionDescription ? { gridColumn: 'span 2' } : {}}
      >
        <FAQQuestionRow onClick={() => toggleItem(index)}>
          <Box>
            <H4>{item.question}</H4>
            {item.questionDescription && (
              <Body>{item.questionDescription}</Body>
            )}
          </Box>
          {isExpanded ? (
            <RemoveIcon sx={{ color: theme.palette.primary.main }} />
          ) : (
            <AddIcon sx={{ color: theme.palette.primary.main }} />
          )}
        </FAQQuestionRow>
        <Collapse in={isExpanded} timeout={300} unmountOnExit>
          <FAQAnswer>{item.answer}</FAQAnswer>
        </Collapse>
      </FAQItemBox>
    );
  };

  return (
    <FAQSectionWrapper>
      {/* Special items with caption that span full width */}
      {leftColumnItems
        .filter(({ item }) => item.questionDescription)
        .map((itemWithIndex) => renderFAQItem(itemWithIndex))}

      <FAQColumnsContainer>
        {/* Left column items */}
        <FAQColumn>
          {leftColumnItems
            .filter(({ item }) => !item.questionDescription)
            .map((itemWithIndex) => renderFAQItem(itemWithIndex))}
        </FAQColumn>

        {/* Right column items */}
        <FAQColumn>
          {rightColumnItems.map((itemWithIndex) =>
            renderFAQItem(itemWithIndex)
          )}
        </FAQColumn>
      </FAQColumnsContainer>
    </FAQSectionWrapper>
  );
};

const FAQSectionWrapper = styled(Box)(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(3)};
`
);

const FAQColumnsContainer = styled(Box)(
  ({ theme }) => `
  display: flex;
  gap: ${theme.spacing(3)};
  width: 100%;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`
);

const FAQColumn = styled(Box)(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(3)};
  flex: 1;
`
);

const FAQItemBox = styled(Box)(
  ({ theme }) => `
  background-color: ${theme.palette.background.paper};
  border-radius: ${theme.shape.borderRadius()};
  padding: ${theme.spacing(3)};
  padding-top: ${theme.spacing(2.5)};
  border: ${theme.shape.borderStandard};
  box-shadow: ${theme.shape.shadowLandingPage};
  width: 100%;
`
);

const FAQQuestionRow = styled(Box)(
  ({ theme }) => `
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${theme.spacing(1)};
  cursor: pointer;
`
);

const FAQAnswer = styled(Body)(
  ({ theme }) => `
  margin-top: ${theme.spacing(2)};
`
);

export default FAQSection;
