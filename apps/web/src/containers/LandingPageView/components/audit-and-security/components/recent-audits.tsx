import { useTheme, Box, styled } from '@mui/material';
import { colors } from '@notional-finance/styles';
import { FormattedMessage } from 'react-intl';
import { ButtonText, ExternalLink } from '@notional-finance/mui';
import { ArrowRightAltIcon } from '@notional-finance/icons';
import { useAuditLinks } from '../use-audit-links';

export const RecentAudits = () => {
  const theme = useTheme();
  const auditLinks = useAuditLinks();
  return (
    <Container>
      <ButtonText
        sx={{
          color: colors.neonTurquoise,
          textTransform: 'uppercase',
          marginBottom: theme.spacing(3),
        }}
      >
        <FormattedMessage defaultMessage={'Recent Audits'} />
      </ButtonText>
      <AuditBlock>
        {auditLinks.map(({ name, route, date }, index) => (
          <ExternalLink
            key={index}
            href={route}
            style={{
              marginBottom: theme.spacing(3),
            }}
          >
            <HoverContainer>
              <Box
                sx={{
                  display: 'flex',
                  color: colors.white,
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                }}
              >
                <ButtonText
                  sx={{
                    color: colors.white,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {name}
                </ButtonText>
                <ButtonText
                  sx={{ color: colors.white, margin: theme.spacing(0, 1) }}
                >
                  |
                </ButtonText>
                <ButtonText
                  sx={{
                    color: colors.white,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {date}
                </ButtonText>
              </Box>
              <ArrowRightAltIcon
                sx={{
                  fontSize: '1rem',
                  marginTop: '3px',
                  marginLeft: theme.spacing(2),
                  fill: colors.white,
                }}
              />
            </HoverContainer>
          </ExternalLink>
        ))}
        <ExternalLink
          href="https://github.com/notional-finance/contracts-v2/blob/master/audits/README.md"
          accent
          style={{
            alignSelf: 'center',
            fontSize: '1rem',
            fontWeight: '500',
            textDecoration: 'underline',
          }}
        >
          <FormattedMessage defaultMessage={'View All Audits'} />
        </ExternalLink>
      </AuditBlock>
    </Container>
  );
};

const Container = styled(Box)(
  ({ theme }) => `
      width: 100%;
      ${theme.breakpoints.down(1220)} {
        width: ${theme.spacing(58)};
      }
      ${theme.breakpoints.down(1000)} {
        width: 100%;
    }
      `
);

const HoverContainer = styled(Box)(`
  display: flex;
  overflow: hidden;
  align-items: flex-start;
  display: flex;
  justify-content: space-between;
    &:hover {
      span {
        transition: all 0.3s ease;
        color: ${colors.neonTurquoise};
      }
      svg {
        transition: all 0.3s ease;
        fill: ${colors.neonTurquoise};
      }

  }
      `);

const AuditBlock = styled(Box)(
  ({ theme }) => `
          display: flex;
          height: fit-content;
          height: ${theme.spacing(32)};
          padding: ${theme.spacing(3)};
          justify-content: center;
          flex-direction: column;
          border-radius: ${theme.shape.borderRadius()};
          background: linear-gradient(to right, rgb(17, 107, 117) 0%, rgb(29, 82, 106) 100%);
          ${theme.breakpoints.down(theme.breakpoints.values.sm)} {
            height: 100%;
            padding: ${theme.spacing(2)};
          }
      `
);

export default RecentAudits;
