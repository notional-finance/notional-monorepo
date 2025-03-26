import { alpha, Box, BoxProps, styled, useTheme } from '@mui/material';
import { Button, H2, LargeInputTextEmphasized } from '@notional-finance/mui';
import { ExternalLinkIcon } from '@notional-finance/icons';
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
    label: string;
    containerProps?: BoxProps;
    content: React.ReactNode;
  }[];
}

// Data Section Component
const DataSection = ({ title, button, contents }: DataSectionProps) => {
  const { isMobileView } = useAppStore();
  const theme = useTheme();
  return (
    <DataSectionContainer>
      <HeaderContainer>
        {isMobileView ? (
          <LargeInputTextEmphasized>{title}</LargeInputTextEmphasized>
        ) : (
          <H2>{title}</H2>
        )}
        {button && !isMobileView && (
          <Button
            variant="contained"
            sx={{
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
            }}
            startIcon={button.icon}
            endIcon={
              button.externalLink && <ExternalLinkIcon sx={{ fontSize: 16 }} />
            }
            onClick={button.onClick}
            href={button.externalLink}
          >
            {button?.label}
          </Button>
        )}
      </HeaderContainer>
      <ContentContainer>
        {contents.map((content) => (
          <Box key={content.label} {...content.containerProps}>
            {content.content}
          </Box>
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
  align-items: center;
  width: 100%;
  gap: ${theme.spacing(3)};

  ${theme.breakpoints.down('sm')} {
    flex-direction: column;
    align-items: flex-start;
    gap: ${theme.spacing(2)};
  }
`
);

export default DataSection;
