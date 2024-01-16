import { Box, useTheme, styled } from '@mui/material';
import { colors } from '@notional-finance/styles';
import { FormattedMessage } from 'react-intl';
import { TokenIcon, LightningIcon } from '@notional-finance/icons';
import { Button, HeadingSubtitle, CardInput } from '@notional-finance/mui';
import fatCat from '../../assets/fat-cat.svg';
import crown from '../../assets/crown.svg';

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
            style={{ height: '16px', marginRight: theme.spacing(1) }}
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
            <TitleText>
              <LightningIcon
                fill={colors.neonTurquoise}
                style={{ marginRight: theme.spacing(1) }}
              />
              <FormattedMessage defaultMessage={'High Roller'} />
            </TitleText>
          ) : (
            <TitleText>
              <img
                src={fatCat}
                alt="icon"
                style={{ height: '24px', marginRight: theme.spacing(1) }}
              />
              <FormattedMessage defaultMessage={'Fat Cat'} />
            </TitleText>
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
  return (
    <Container>
      <TitleText
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: theme.spacing(4),
          letterSpacing: '10px',
        }}
      >
        <FormattedMessage defaultMessage={'Prizes'} />
        <Button
          size="large"
          variant="outlined"
          to="/contest-rules"
          sx={{
            width: '358px',
            border: `1px solid ${colors.neonTurquoise}`,
            ':hover': {
              background: colors.matteGreen,
            },
            fontFamily: 'Avenir Next',
          }}
        >
          <FormattedMessage defaultMessage={'Rules & Prizes'} />
        </Button>
      </TitleText>
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
      flex-direction: column;
      align-items: center;
      gap: ${theme.spacing(10)};
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
      `
);

const PrizePlaceContainer = styled(Box)(
  () => `
    display: flex;
    justify-content: space-between;
    width: 100%;
      `
);

const InfoContainer = styled(Box)(
  ({ theme }) => `
    display: flex;
    gap: ${theme.spacing(6)};
      `
);

const Place = styled(HeadingSubtitle)(`
  color: ${colors.greenGrey};
  font-weight: 600;
  text-transform: uppercase;
`);

const TitleText = styled(Box)(
  ({ theme }) => `
  color: ${colors.white};
  text-align: left;
  font-family: Avenir Next;
  font-size: 24px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  letter-spacing: 2.4px;
  text-transform: uppercase;
  text-wrap: nowrap;
  margin-bottom: ${theme.spacing(1)};
      `
);

export default ContestPrizes;
