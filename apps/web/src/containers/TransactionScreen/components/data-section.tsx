import { alpha, Box, styled, useTheme } from '@mui/material';
import { Button, H2, LargeInputTextEmphasized } from '@notional-finance/mui';
import { ExternalLinkIcon } from '@notional-finance/icons';
import { TotalBox } from './total-box';
import { useAppStore } from '@notional-finance/notionable-hooks';
interface DataSectionProps {
  title: string;
  button?: {
    label: string;
    icon?: React.ReactNode;
    onClick?: () => void;
    externalLink?: string;
  };
  totalBoxes: {
    title: string;
    value: number;
    decimals?: number;
    suffix?: string;
    prefix?: string;
    trend?: {
      value: number;
      direction: 'up' | 'down';
      duration: string;
    };
  }[];
  children?: React.ReactNode;
}

// Data Section Component
const DataSection = ({
  title,
  button,
  totalBoxes,
  children,
}: DataSectionProps) => {
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
        <TotalBoxContainer>
          {totalBoxes.map((totalBox) => (
            <TotalBox key={totalBox.title} {...totalBox} />
          ))}
        </TotalBoxContainer>
        <Box>{children}</Box>
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

const TotalBoxContainer = styled(Box)(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  gap: ${theme.spacing(3)};

  ${theme.breakpoints.down('sm')} {
    width: 100%;
    gap: ${theme.spacing(2)};
  }
`
);
export default DataSection;
