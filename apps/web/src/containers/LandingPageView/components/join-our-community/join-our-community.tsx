import { useTheme, Box, styled } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { useJoinOurCommunity } from './use-join-our-community';
import { colors } from '@notional-finance/styles';
import { H5, H2 } from '@notional-finance/mui';
import { CommunityCard } from './community-card';

export const JoinOurCommunity = () => {
  const theme = useTheme();
  const communityData = useJoinOurCommunity();
  return (
    <BackgroundContainer>
      <InnerContainer>
        <Box sx={{ marginBottom: theme.spacing(3) }}>
          <H5 sx={{ color: colors.aqua, marginBottom: theme.spacing(2) }}>
            <FormattedMessage defaultMessage={'Join Our Community'} />
          </H5>
          <Header>
            <FormattedMessage defaultMessage={'Get Involved'} />
          </Header>
        </Box>
        <CardContainer>
          {communityData.map(({ title, link, linkText, icon, text }, index) => (
            <CommunityCard
              key={index}
              title={title}
              link={link}
              linkText={linkText}
              icon={icon}
              text={text}
            />
          ))}
        </CardContainer>
      </InnerContainer>
    </BackgroundContainer>
  );
};

const BackgroundContainer = styled(Box)(
  `
    height: 100%;
    width: 100%;
    background: ${colors.white};
    `
);

const InnerContainer = styled(Box)(
  ({ theme }) => `
    width: 896px;
    margin: auto;
    padding-top: ${theme.spacing(15)};
    padding-bottom: ${theme.spacing(15)};
    ${theme.breakpoints.down(1000)} {
        width: 90%;
    }

      `
);
const CardContainer = styled(Box)(
  ({ theme }) => `
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    ${theme.breakpoints.down(1000)} {
        justify-content: space-evenly;
    }
    ${theme.breakpoints.down('sm')} {
        justify-content: flex-start;
    }
      `
);
const Header = styled(H2)(
  ({ theme }) => `
    color: ${colors.black}; 
    margin-bottom: ${theme.spacing(10)};
    ${theme.breakpoints.down('sm')} {
        margin-bottom: ${theme.spacing(7)};
        font-size: 1.5rem;
    }
      `
);

export default JoinOurCommunity;
