import { Box, BoxProps, styled } from '@mui/material';
import { Button, H2, LargeInputTextEmphasized } from '@notional-finance/mui';
import { useAppStore } from '@notional-finance/notionable-hooks';

interface DataSectionProps {
  title: string;
  button?: {
    label: string;
    icon?: React.ReactNode;
    onClick?: () => void;
    externalLink?: string;
  };
  contents: {
    containerProps?: BoxProps;
    content: React.ReactNode;
  }[];
}

const DataSection = ({ title, button, contents }: DataSectionProps) => {
  const { isMobileView } = useAppStore();
  return (
    <DataSectionContainer>
      <HeaderContainer>
        {isMobileView ? (
          <LargeInputTextEmphasized>{title}</LargeInputTextEmphasized>
        ) : (
          <H2>{title}</H2>
        )}
        {button && !isMobileView && (
          <CustomButton
            variant="contained"
            startIcon={button.icon}
            onClick={button.onClick}
            href={button.externalLink}
          >
            {button?.label}
          </CustomButton>
        )}
      </HeaderContainer>
      <ContentContainer>
        {contents.map((content) => (
          <Box {...content.containerProps}>{content.content}</Box>
        ))}
      </ContentContainer>
    </DataSectionContainer>
  );
};

const DataSectionContainer = styled(Box)(
  ({ theme }) => `
  gap: ${theme.spacing(2.25)};
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
`
);

const HeaderContainer = styled(Box)(
  () => `
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`
);

const ContentContainer = styled(Box)(
  ({ theme }) => `
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
  gap: ${theme.spacing(3)};

  ${theme.breakpoints.down('sm')} {
    flex-direction: column;
    align-items: flex-start;
    gap: ${theme.spacing(2)};
  }
`
);

const CustomButton = styled(Button)(
  ({ theme }) => `
  background-color: ${theme.palette.background.paper};
  color: ${theme.palette.typography.accent};
  font-weight: 600;
  font-size: '14px';
`
);

export default DataSection;
