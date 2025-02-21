import { ChevronLeft } from '@mui/icons-material';
import { Box, styled, useTheme } from '@mui/material';
import { TokenIcon } from '@notional-finance/icons';
import { useNavigate } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import {
  Body,
  Button,
  Caption,
  H4,
  H5,
  LabelValue,
} from '@notional-finance/mui';

interface PortfolioDetailProps {
  token: {
    symbol: string;
    label: string;
    caption?: string;
  };
  header: {
    label?: string | React.ReactNode;
    caption?: string;
  };
  contentSections: {
    title: string;
    rows: {
      label: string | React.ReactNode;
      value: {
        text: string | React.ReactNode;
        color?: string;
      };
      caption?: string;
    }[];
  }[];
  buttonData?: {
    label: string | React.ReactNode;
    onClick?: () => void;
  }[];
}

const PortfolioDetail: React.FC<PortfolioDetailProps> = ({
  token,
  header,
  contentSections,
  buttonData,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <>
      <Container>
        <BackButtonContainer onClick={() => navigate(-1)}>
          <ChevronLeft
            sx={{
              color: theme.palette.typography.main,
            }}
          />
          <H4>
            <FormattedMessage defaultMessage="Back" />
          </H4>
        </BackButtonContainer>
        <HeaderContainer>
          <TokenContainer>
            <TokenIcon symbol={token.symbol} size="xl" />
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
              }}
            >
              <H4>{token.label}</H4>
              <Caption>{token.caption}</Caption>
            </Box>
          </TokenContainer>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              justifyContent: 'flex-start',
            }}
          >
            {header.label && <LabelValue>{header.label}</LabelValue>}
            {header.caption && <Caption>{header.caption}</Caption>}
          </Box>
        </HeaderContainer>

        {contentSections.map((cs) => {
          return (
            <ContentContainer>
              <H5>{cs.title}</H5>
              {cs.rows.map((r) => {
                return (
                  <Row>
                    <Body sx={{ color: theme.palette.typography.main }}>
                      {r.label}
                    </Body>
                    <Column>
                      <StackLabelValue color={r.value.color}>
                        {r.value.text}
                      </StackLabelValue>
                      {r.caption && <Caption>{r.caption}</Caption>}
                    </Column>
                  </Row>
                );
              })}
            </ContentContainer>
          );
        })}
      </Container>
      {buttonData && (
        <ActionButtonContainer>
          {buttonData.map((button, index) => (
            <Button key={index} variant="outlined" color="primary" fullWidth>
              {button.label}
            </Button>
          ))}
        </ActionButtonContainer>
      )}
    </>
  );
};

const Container = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
});

const BackButtonContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  gap: theme.spacing(1),
  padding: theme.spacing(1),
}));

export const HeaderContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  padding: theme.spacing(0, 2),
  paddingBottom: theme.spacing(2),
}));

const TokenContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  gap: theme.spacing(1),
}));

const ContentContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.borders.paper}`,
  borderBottom: `1px solid ${theme.palette.borders.paper}`,
  background: theme.palette.background.paper,
}));

const Row = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
}));

const Column = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
}));

const ActionButtonContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  padding: theme.spacing(1, 2),
  position: 'fixed',
  bottom: 80,
  left: 0,
  right: 0,
  background: theme.palette.background.paper,
  gap: theme.spacing(2),
  zIndex: 1000,
  borderBottom: `1px solid ${theme.palette.borders.paper}`,
  boxShadow: '0px -10px 20px -10px rgba(20, 42, 74, 0.20)',
}));

const StackLabelValue = styled(LabelValue)(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
}));

export default PortfolioDetail;
