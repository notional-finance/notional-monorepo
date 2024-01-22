import { useTheme, Box } from '@mui/material';
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

export const ContestConfirmation = () => {
  const theme = useTheme();
  const truncatedAddress = useTruncatedAddress();
  return (
    <StepContainer sx={{ height: '100% !important' }}>
      <TitleText>
        <FormattedMessage defaultMessage="You are in!" />
      </TitleText>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Box>
          <ContestCountDown
            title={'Contest Begins:'}
            sx={{ marginBottom: theme.spacing(4) }}
          />
          <Box sx={{ textAlign: 'left', width: '437px' }}>
            <ContestBodyText sx={{ display: 'list-item', lineHeight: '40px' }}>
              <FormattedMessage
                defaultMessage={
                  'You are entered with the address: {truncatedAddress}'
                }
                values={{
                  truncatedAddress: truncatedAddress,
                }}
              />
            </ContestBodyText>
            <ContestBodyText sx={{ display: 'list-item', lineHeight: '40px' }}>
              <FormattedMessage
                defaultMessage={`
              The contest runs Feb 5th 12:00 am PST through Mar 5th 12:00 am PST.`}
              />
            </ContestBodyText>
            <ContestBodyText sx={{ display: 'list-item', lineHeight: '40px' }}>
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
          </Box>
        </Box>
        <img
          src={blitzPass}
          alt="blitz pass"
          style={{ height: '287px', marginLeft: theme.spacing(9) }}
        />
      </Box>
      <Button
        size="large"
        sx={{
          width: '330px',
          fontFamily: 'Avenir Next',
          cursor: 'pointer',
        }}
        to={'/portfolio'}
      >
        <FormattedMessage defaultMessage={'See Yield Opportunities'} />
      </Button>
    </StepContainer>
  );
};

export default ContestConfirmation;
