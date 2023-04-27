import { Box, styled, useTheme } from '@mui/material';
import { useUserCards } from '../use-user-cards';
import { colors } from '@notional-finance/styles';
import { BodySecondary, ExternalLink } from '@notional-finance/mui';
import twitter from '@notional-finance/assets/images/logos/twitter.svg';
import quotes from '@notional-finance/assets/images/logos/quotes.svg';

export const UserCards = () => {
  const theme = useTheme();
  const userCards = useUserCards();
  return (
    <CardContainer>
      {userCards.map(({ name, title, text, twitterLink, logo }, index) => (
        <Wrapper key={index}>
          <img
            src={logo}
            alt="logo"
            style={{
              height: theme.spacing(10),
              width: '100%',
              marginTop: `-${theme.spacing(4)}`,
            }}
          />
          <Card key={index}>
            <Box>
              <img src={quotes} alt="quotes" style={{ height: '31px' }} />
              <BodyText sx={{ marginTop: theme.spacing(3) }}>{text}</BodyText>
            </Box>
            <TitleContainer>
              <div>
                <BodyText sx={{ color: colors.neonTurquoise }}>{name}</BodyText>
                <BodyText
                  sx={{
                    color: colors.neonTurquoise,
                    fontStyle: 'italic',
                  }}
                >
                  {title}
                </BodyText>
              </div>
              <ExternalLink href={twitterLink}>
                <img src={twitter} alt="twitter" style={{ height: '20px' }} />
              </ExternalLink>
            </TitleContainer>
          </Card>
        </Wrapper>
      ))}
    </CardContainer>
  );
};

const CardContainer = styled(Box)(
  ({ theme }) => `
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-direction: row;
        gap: ${theme.spacing(6)};
        ${theme.breakpoints.down(1220)} {
          flex-wrap: wrap;
        }
        ${theme.breakpoints.down(1000)} {
          gap: ${theme.spacing(4)};
        }
        ${theme.breakpoints.down('sm')} {
          gap: ${theme.spacing(9)};
        }
    `
);

const Wrapper = styled(Box)(
  ({ theme }) => `
        width: 100%;
        height: ${theme.spacing(53)};
        background: ${colors.matteGreen};
        border: 1px solid ${colors.blueGreen};
        border-radius: ${theme.shape.borderRadius()};
        ${theme.breakpoints.down(1220)} {
          max-width: calc(95% / 2);
        };
        ${theme.breakpoints.down('sm')} {
          max-width: 100%;
        }
    `
);
const Card = styled(Box)(
  ({ theme }) => `
        margin-top: -5px;
        padding: ${theme.spacing(4)};
        padding-top: 0px;
        width: inherit;
        height: 89%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    `
);

const TitleContainer = styled(Box)(
  `
        display: flex;
        justify-content: space-between;
        align-items: center;
    `
);

const BodyText = styled(BodySecondary)(`font-size: 1rem;`);

export default UserCards;
