import { styled, Box, useTheme } from '@mui/material';
import twitterIcon from '@notional-finance/assets/images/logos/twitter-two-tone-light.svg';
import {
  NotePageSectionTitle,
  SubText,
  ContentBox,
  ContentContainer,
  CardContainer,
  CardSubText,
} from '../components';
import { colors } from '@notional-finance/styles';
import { Button, Subtitle } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import { useDelegateData } from './use-delegate-data';

export const NoteDelegate = () => {
  const theme = useTheme();
  const delegateData = useDelegateData();
  return (
    <ContentContainer id="delegate">
      <NotePageSectionTitle
        title={<FormattedMessage defaultMessage={'Delegate'} />}
      />
      <SubText>
        <FormattedMessage
          defaultMessage={
            'Delegate your votes to active governance participants. Explore the profiles and principles of Notional delegates.'
          }
        />
      </SubText>
      <CardContainer>
        {delegateData.map(
          ({ title, subTitle, description, twitterCount, twitterLink }, i) => (
            <ContentBox key={i}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Subtitle sx={{ fontWeight: 600, color: colors.white }}>
                  {title}
                  <CardSubText sx={{ paddingTop: theme.spacing(0.5) }}>
                    {subTitle}
                  </CardSubText>
                </Subtitle>
                <DelegatePill>
                  <FormattedMessage defaultMessage={'Delegate'} />
                </DelegatePill>
              </Box>

              <Subtitle
                sx={{ margin: theme.spacing(3, 0), color: colors.white }}
              >
                {description}
              </Subtitle>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: theme.spacing(3),
                }}
              >
                <CardSubText sx={{ paddingTop: '0px' }}>
                  {twitterCount}
                </CardSubText>
                <Box component={'a'} href={twitterLink} target={'_blank'}>
                  <img
                    src={twitterIcon}
                    alt="twitter"
                    style={{
                      height: theme.spacing(4),
                      width: theme.spacing(4),
                    }}
                  />
                </Box>
              </Box>
            </ContentBox>
          )
        )}
      </CardContainer>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: theme.spacing(7),
          marginBottom: theme.spacing(12),
        }}
      >
        <Button
          size="large"
          variant="outlined"
          sx={{
            width: theme.spacing(37),
            border: `1px solid ${colors.neonTurquoise}`,
            background: '#041D2E',
            cursor: 'pointer',
            ':hover': {
              background: colors.matteGreen,
            },
            fontFamily: 'Avenir Next',
          }}
          href={'https://dune.com/PierreYves_Gendron/notional-delegation'}
        >
          <FormattedMessage defaultMessage={'Explore All Delegates'} />
        </Button>
      </Box>
    </ContentContainer>
  );
};

const DelegatePill = styled(Box)(
  ({ theme }) => `
      background-color: ${colors.darkGreen};
      color: ${colors.neonTurquoise};
      font-size: 16px;
      border-radius: ${theme.shape.borderRadius()};
      padding: ${theme.spacing(0.625, 1.5)};
      
  `
);

export default NoteDelegate;
