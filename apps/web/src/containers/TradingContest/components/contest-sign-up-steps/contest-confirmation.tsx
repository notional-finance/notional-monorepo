import { styled, useTheme, Box } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { ExternalLink, Button } from '@notional-finance/mui';
import { ContestCountDown } from '../contest-countdown/contest-countdown';
import { useTruncatedAddress } from '@notional-finance/notionable-hooks';
import blitzPass from './assets/blitzPass.svg';
import {
  TitleText,
  ContestBodyText,
  StepContainer,
} from '../contest-shared-elements/contest-shared-elements';
import { useSelectedNetwork } from '@notional-finance/wallet';

export const ContestConfirmation = () => {
  const theme = useTheme();
  const truncatedAddress = useTruncatedAddress();
  const network = useSelectedNetwork();
  return (
    <StepContainer sx={{ marginTop: '0px !important' }}>
      <TitleText>
        <FormattedMessage defaultMessage="You are in!" />
      </TitleText>
      <ContentContainer>
        <Box>
          <ContestCountDown
            title={'Contest Begins:'}
            sx={{ marginBottom: theme.spacing(4) }}
          />
          <TextContainer>
            <ContestBodyText
              sx={{ display: 'list-item', lineHeight: theme.spacing(5) }}
            >
              <FormattedMessage
                defaultMessage={
                  'You are entered with the address: {truncatedAddress}'
                }
                values={{
                  truncatedAddress: truncatedAddress,
                }}
              />
            </ContestBodyText>
            <ContestBodyText
              sx={{ display: 'list-item', lineHeight: theme.spacing(5) }}
            >
              <FormattedMessage
                defaultMessage={`
              The contest runs Feb 5th 12:00 am PST through Mar 5th 12:00 am PST.`}
              />
            </ContestBodyText>
            <ContestBodyText
              sx={{ display: 'list-item', lineHeight: theme.spacing(5) }}
            >
              <FormattedMessage
                defaultMessage={`Stay up to date, follow us <a1>twitter</a1> or join us on <a2>discord</a2>`}
                values={{
                  a1: (msg: React.ReactNode) => (
                    <ExternalLink
                      accent
                      textDecoration
                      href="https://twitter.com/NotionalFinance"
                    >
                      {msg}
                    </ExternalLink>
                  ),
                  a2: (msg: React.ReactNode) => (
                    <ExternalLink
                      accent
                      textDecoration
                      href="https://discord.notional.finance"
                    >
                      {msg}
                    </ExternalLink>
                  ),
                }}
              />
            </ContestBodyText>
          </TextContainer>
        </Box>
        <BlitzPass src={blitzPass} alt="blitz pass" />
      </ContentContainer>
      <Button
        size="large"
        sx={{
          width: '330px',
          fontFamily: 'Avenir Next',
          cursor: 'pointer',
        }}
        to={`/portfolio/${network}`}
      >
        <FormattedMessage defaultMessage={'See Yield Opportunities'} />
      </Button>
    </StepContainer>
  );
};

const ContentContainer = styled(Box)(
  ({ theme }) => `
    display: flex;
    justify-content: center;
    margin: ${theme.spacing(3)};
      ${theme.breakpoints.down('sm')} {
        flex-direction: column;
        width: 90%;
        margin: ${theme.spacing(4)} auto;
        margin-bottom: ${theme.spacing(4)};
      }
      `
);

const TextContainer = styled(Box)(
  ({ theme }) => `
      text-align: left;
      width: ${theme.spacing(54)};
      ${theme.breakpoints.down('sm')} {
        width: 100%;
      }
      `
);

const BlitzPass = styled('img')(
  ({ theme }) => `
    height: ${theme.spacing(35)};
    margin-left: ${theme.spacing(9)};
      ${theme.breakpoints.down('sm')} {
        margin: 0px;
        transform: rotate(-90deg);
      }
      `
);

export default ContestConfirmation;
