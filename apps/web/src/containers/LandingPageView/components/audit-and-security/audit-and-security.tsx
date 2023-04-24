import { useTheme, Box, styled } from '@mui/material';
import { colors } from '@notional-finance/styles';
import { FormattedMessage } from 'react-intl';
import { RecentAudits, BugBounty } from './components';
import { H5, H2, Body, ExternalLink } from '@notional-finance/mui';

export const AuditAndSecurity = () => {
  const theme = useTheme();

  return (
    <BackgroundContainer>
      <InnerContainer>
        <Box sx={{ marginBottom: theme.spacing(3) }}>
          <H5
            sx={{ color: colors.neonTurquoise, marginBottom: theme.spacing(2) }}
          >
            <FormattedMessage defaultMessage={'Audits & Security'} />
          </H5>
          <H2 sx={{ color: colors.white }}>
            <FormattedMessage
              defaultMessage={'A Multidisciplinary Approach to Security'}
            />
          </H2>
        </Box>
        <BodyText>
          <FormattedMessage
            defaultMessage={
              'We invest in thorough testing and auditing of our smart contracts. Our contracts are open source so developers can <a>review our code</a> and we have an active bug bounty. Contact the security team at {mailToLink}.'
            }
            values={{
              a: (chunk: React.ReactNode) => (
                <ExternalLink
                  accent
                  style={{ color: colors.neonTurquoise }}
                  href="https://github.com/notional-finance/contracts-v2"
                >
                  {chunk}
                </ExternalLink>
              ),
              mailToLink: (
                <ExternalLink href="mailto:security@notional.finance">
                  security@notional.finance
                </ExternalLink>
              ),
            }}
          />
        </BodyText>
        <CardContainer>
          <RecentAudits />
          <BugBounty />
        </CardContainer>
      </InnerContainer>
    </BackgroundContainer>
  );
};

const BackgroundContainer = styled(Box)(
  `
        height: 100%;
        width: 100%;
        background: ${colors.black};
    `
);

const InnerContainer = styled(Box)(
  ({ theme }) => `
        width: ${theme.spacing(150)};
        margin: auto;
        padding-top: ${theme.spacing(15)};
        padding-bottom: ${theme.spacing(15)};
        ${theme.breakpoints.down(1220)} {
          width: ${theme.spacing(125)};
        }
        ${theme.breakpoints.down(1000)} {
            width: 90%;
        }
    `
);

const CardContainer = styled(Box)(
  ({ theme }) => `
    display: flex;
    flex-direction: row;
    gap: ${theme.spacing(8)};
    ${theme.breakpoints.down(1220)} {
      justify-content: space-between;
    }

    ${theme.breakpoints.down(1000)} {
      flex-direction: column;
    }
    `
);

const BodyText = styled(Body)(
  ({ theme }) => `
    color: ${colors.lightGrey};
    margin-bottom: ${theme.spacing(10)};
    width: ${theme.spacing(102)};
    ${theme.breakpoints.down(1000)} {
        width: 100%;
    }
    `
);

export default AuditAndSecurity;
