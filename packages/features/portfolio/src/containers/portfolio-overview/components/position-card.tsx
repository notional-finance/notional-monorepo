import { Box, styled, Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { TokenIcon } from '@notional-finance/icons';
import { Link } from 'react-router-dom';
import { useSelectedNetwork } from '@notional-finance/notionable-hooks';
import { Button } from '@notional-finance/mui';

interface IProps {
  tokenId: string;
  header: {
    tokenSymbol: string;
    tokenName: string;
    description?: React.ReactNode | null;
  };
  data: {
    [key: string]: {
      value: string | null;
      description?: string | null;
      textColor?: string | null;
    };
  };
}

const PositionCard: React.FC<IProps> = (props) => {
  const { header, data, tokenId } = props;
  const network = useSelectedNetwork();

  return (
    <Container>
      <HeaderContainer>
        <TokenIcon symbol={header.tokenSymbol} size="xxl" />
        <Box>
          <Header variant="h3" sx={{ marginBottom: 0 }}>
            {header.tokenName}
          </Header>
          <Caption variant="caption">{header.description}</Caption>
        </Box>
      </HeaderContainer>
      <Content>
        {Object.entries(data).map(([key, item]) => (
          <Row key={key}>
            <Title variant="h4">{key}</Title>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
              }}
            >
              <Value variant="body1" sx={{ color: item.textColor }}>
                {item.value}
              </Value>
              {item.description && (
                <Caption variant="caption">{item.description}</Caption>
              )}
            </Box>
          </Row>
        ))}
      </Content>
      <Button
        variant="outlined"
        to={`/portfolio/${network}/details/${tokenId}`}
        LinkComponent={Link}
        fullWidth
      >
        <FormattedMessage
          defaultMessage="View Details"
          description="view details"
        />
      </Button>
    </Container>
  );
};

export const Container = styled(Box)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.borders.default}`,
  background: theme.palette.background.paper,
  padding: theme.spacing(2),
  paddingBottom: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

export const HeaderContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
}));

export const Header = styled(Typography)(({ theme }) => ({
  fontSize: theme.typography.pxToRem(16),
  fontWeight: theme.typography.fontWeightRegular,
  lineHeight: 1.4,
  color: theme.palette.typography.main,
  marginBottom: 0,
}));

const Title = styled(Typography)(({ theme }) => ({
  fontSize: theme.typography.pxToRem(14),
  fontWeight: theme.typography.fontWeightRegular,
  lineHeight: 1.4,
  color: theme.palette.typography.main,
}));

const Value = styled(Typography)(({ theme }) => ({
  fontSize: theme.typography.pxToRem(14),
  fontWeight: theme.typography.fontWeightRegular,
  lineHeight: 1.4,
  color: theme.palette.typography.main,
  marginBottom: 0,
  textAlign: 'right',
}));

export const Content = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

export const Row = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  gap: theme.spacing(2),
}));

export const Caption = styled(Typography)(({ theme }) => ({
  fontSize: theme.typography.pxToRem(12),
  color: theme.palette.typography.light,
  fontWeight: theme.typography.fontWeightRegular,
  lineHeight: 1.4,
  marginBottom: 0,
  textAlign: 'right',
}));

export default PositionCard;
