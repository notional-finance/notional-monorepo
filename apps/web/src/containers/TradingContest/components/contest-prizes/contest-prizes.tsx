import { Box, useTheme, styled } from '@mui/material';
import { colors } from '@notional-finance/styles';
import { FormattedMessage } from 'react-intl';
import { TokenIcon, LightningIcon } from '@notional-finance/icons';
import { Button, HeadingSubtitle, CardInput } from '@notional-finance/mui';
import { SectionTitle } from '../contest-shared-elements/contest-shared-elements';
import fatCat from '../../assets/fat-cat.svg';
import crown from '../../assets/crown.svg';
import { useSelectedNetwork } from '@notional-finance/wallet';

interface PrizeInfoPropsProps {
  prizeType: string;
}

const PrizePlaces = () => {
  const theme = useTheme();
  return (
    <PrizePlaceContainer>
      <Place>
        <FormattedMessage defaultMessage={'1st Place'} />
        <CardInput>
          <img
            src={crown}
            alt="icon"
            style={{ height: theme.spacing(2), marginRight: theme.spacing(1) }}
          />
          10,000 NOTE
        </CardInput>
      </Place>
      <Place>
        <FormattedMessage defaultMessage={'2nd Place'} />
        <CardInput>2,500 NOTE</CardInput>
      </Place>
      <Place>
        <FormattedMessage defaultMessage={'3rd Place'} />
        <CardInput>1,000 NOTE</CardInput>
      </Place>
    </PrizePlaceContainer>
  );
};

const PrizeInfo = ({ prizeType }: PrizeInfoPropsProps) => {
  const theme = useTheme();
  return (
    <PrizeInfoContainer>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: theme.spacing(7),
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          {prizeType === 'HR' ? (
            <PrizeHeaderContainer>
              <LightningIcon
                fill={colors.neonTurquoise}
                style={{ marginRight: theme.spacing(1) }}
              />
              <FormattedMessage defaultMessage={'High Roller'} />
            </PrizeHeaderContainer>
          ) : (
            <PrizeHeaderContainer>
              <img
                src={fatCat}
                alt="icon"
                style={{
                  height: theme.spacing(3),
                  marginRight: theme.spacing(1),
                }}
              />
              <FormattedMessage defaultMessage={'Fat Cat'} />
            </PrizeHeaderContainer>
          )}

          <HeadingSubtitle sx={{ color: colors.greenGrey, fontWeight: 400 }}>
            {prizeType === 'HR' ? (
              <FormattedMessage
                defaultMessage={'Highest realized APY using leverage'}
              />
            ) : (
              <FormattedMessage
                defaultMessage={'Highest realized APY without leverage'}
              />
            )}
          </HeadingSubtitle>
        </Box>
        <TokenIcon symbol="NOTE" size="large" />
      </Box>
      <PrizePlaces />
    </PrizeInfoContainer>
  );
};

export const ContestPrizes = () => {
  const theme = useTheme();
  const network = useSelectedNetwork();
  const pathname = window.location.pathname;
  return (
    <Container>
      <SectionTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box id="prizes-header">
          <FormattedMessage defaultMessage={'Prizes'} />
        </Box>
        {/* TODO: Show this if the user has minted a contest pass */}
        {pathname === '/contest' && (
          <Button
            size="large"
            variant="outlined"
            to={`/contest-rules/${network}`}
            sx={{
              width: theme.spacing(41.25),
              border: `1px solid ${colors.neonTurquoise}`,
              ':hover': {
                background: colors.matteGreen,
              },
              fontFamily: 'Avenir Next',
              marginTop: theme.spacing(3),
            }}
          >
            <FormattedMessage defaultMessage={'Rules & Prizes'} />
          </Button>
        )}
      </SectionTitle>
      <InfoContainer>
        <PrizeInfo prizeType="HR" />
        <PrizeInfo prizeType="FC" />
      </InfoContainer>
    </Container>
  );
};

const Container = styled(Box)(
  ({ theme }) => `
    display: flex;
    flex-direction: column;
    margin-top: ${theme.spacing(10)};
    margin-bottom: ${theme.spacing(22)};
    justify-content: space-between;
    ${theme.breakpoints.down('md')} {
      gap: ${theme.spacing(10)};
      margin: ${theme.spacing(10)} auto;
    }
    `
);

const PrizeInfoContainer = styled(Box)(
  ({ theme }) => `
    display: block;
    border-radius: 6px;
    flex: 1;
    border: 1px solid var(--Accent-Neon, #33F8FF);
    background: rgba(51, 248, 255, 0.10);
    padding: ${theme.spacing(4)};
    ${theme.breakpoints.down('sm')} {
      padding: ${theme.spacing(2)};
    }
      `
);

const PrizePlaceContainer = styled(Box)(
  ({ theme }) => `
    display: flex;
    justify-content: space-between;
    width: 100%;
    ${theme.breakpoints.down('sm')} {
      h6, span {
        font-size: 14px;
      }
    }
      `
);

const InfoContainer = styled(Box)(
  ({ theme }) => `
    display: flex;
    gap: ${theme.spacing(6)};
    ${theme.breakpoints.down('sm')} {
      flex-direction: column;
    }
      `
);
const PrizeHeaderContainer = styled(SectionTitle)(
  ({ theme }) => `
      ${theme.breakpoints.down('md')} {
        text-align: left;
        letter-spacing: 2.4px;
      }
      `
);

const Place = styled(HeadingSubtitle)(`
  color: ${colors.greenGrey};
  font-weight: 600;
  text-transform: uppercase;
`);

export default ContestPrizes;
