import { Box, styled, useTheme } from '@mui/material';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import {
  NotePageSectionTitle,
  SubText,
  ContentBox,
  ContentContainer,
  CardContainer,
  CardSubText,
} from '../components';
import { CheckmarkIcon } from '@notional-finance/icons';
import { FormattedMessage } from 'react-intl';
import { useGovernanceData } from './use-governance-data';
import { Button, Caption, CardInput, Subtitle } from '@notional-finance/mui';
import { NotionalTheme, colors } from '@notional-finance/styles';
import {
  truncateAddress,
  formatNumberAsAbbr,
  formatNumberAsPercent,
} from '@notional-finance/helpers';
import { getDateString } from '@notional-finance/util';

interface TopCardPillProps {
  active: boolean;
  theme: NotionalTheme;
}

export const NoteGovernance = () => {
  const theme = useTheme();
  const govData = useGovernanceData();

  return (
    <ContentContainer id="governance">
      <NotePageSectionTitle
        title={<FormattedMessage defaultMessage={'Governance'} />}
      />
      <SubText>
        <FormattedMessage
          defaultMessage={
            'Participate in Notional governance by discussing proposals in the Notional forum and voting on them on Snapshot.'
          }
        />
      </SubText>
      <CardContainer>
        {govData.map((topic: any, i) => (
          <ContentBox sx={{ cursor: 'pointer' }} key={i}>
            <Box
              component={'a'}
              key={topic.id}
              target="_blank"
              href={`https://snapshot.org/#/notional.eth/proposal/${topic.id}`}
            >
              <TopCardData>
                <Subtitle sx={{ fontWeight: 600, color: colors.white }}>
                  {truncateAddress(topic.author)}
                </Subtitle>
                <TopCardPill active={topic.state === 'active'} theme={theme}>
                  {topic.state}
                </TopCardPill>
              </TopCardData>
              <CardInput
                sx={{
                  marginBottom: theme.spacing(3),
                  height: '90px',
                  overflow: 'hidden',
                }}
              >
                {topic.title}
              </CardInput>
              {topic.scores.map((score, idx) => (
                <VoteMetrics key={idx}>
                  <CardCaption
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {idx === 0 ? (
                      <CheckmarkIcon
                        sx={{
                          height: theme.spacing(3),
                          marginRight: theme.spacing(1.5),
                        }}
                      />
                    ) : (
                      <HighlightOffIcon
                        sx={{
                          height: theme.spacing(3),
                          fill: colors.red,
                          marginRight: theme.spacing(1.5),
                        }}
                      />
                    )}
                    {`${idx === 0 ? 'For' : 'Against'} ${formatNumberAsAbbr(
                      score,
                      1,
                      '',
                      { hideSymbol: true }
                    )} NOTE`}
                  </CardCaption>
                  <CardCaption>
                    {formatNumberAsPercent((score / topic.scores_total) * 100)}
                  </CardCaption>
                </VoteMetrics>
              ))}
              <CardSubText>
                {`${
                  topic.state === 'active' ? 'Ends' : 'Ended'
                } ${getDateString(topic.end)}`}{' '}
                |{' '}
                {formatNumberAsPercent(
                  (topic.scores_total / topic.quorum) * 100
                )}{' '}
                quorum reached
              </CardSubText>
            </Box>
          </ContentBox>
        ))}
      </CardContainer>
      <ButtonContainer>
        <Button
          size="large"
          variant="outlined"
          sx={{
            width: theme.spacing(37),
            border: `1px solid ${colors.neonTurquoise}`,
            cursor: 'pointer',
            ':hover': {
              background: colors.matteGreen,
            },
            fontFamily: 'Avenir Next',
          }}
          href={'https://forum.notional.finance/'}
        >
          <FormattedMessage defaultMessage={'View Forum'} />
        </Button>
        <Button
          size="large"
          variant="outlined"
          sx={{
            width: theme.spacing(37),
            border: `1px solid ${colors.neonTurquoise}`,
            cursor: 'pointer',
            ':hover': {
              background: colors.matteGreen,
            },
            fontFamily: 'Avenir Next',
          }}
          href={'https://snapshot.org/#/notional.eth'}
        >
          <FormattedMessage defaultMessage={'View Snapshot'} />
        </Button>
      </ButtonContainer>
    </ContentContainer>
  );
};

const TopCardData = styled(Box)(
  ({ theme }) => `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: ${theme.spacing(4)};
  `
);

const ButtonContainer = styled(Box)(
  ({ theme }) => `
      display: flex;
      padding-top: ${theme.spacing(8)};
      gap: ${theme.spacing(5)};
      justify-content: center;
      ${theme.breakpoints.down('sm')} {
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
      }
  `
);

const CardCaption = styled(Caption)(
  `
    font-weight: 500;
    color: ${colors.white};
  `
);

const VoteMetrics = styled(Box)(
  ({ theme }) => `
  background-color: ${colors.darkGreen};
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: ${theme.spacing(1)};
  margin-bottom: ${theme.spacing(1)};
  border-radius: ${theme.shape.borderRadius()};
  border: ${theme.shape.borderStandard};
  `
);

const TopCardPill = styled(Box, {
  shouldForwardProp: (prop: string) => prop !== 'active',
})(
  ({ theme, active }: TopCardPillProps) => `
      background-color: ${active ? colors.neonTurquoise : colors.darkGreen};
      color: ${active ? colors.black : colors.greenGrey};
      border-radius: 20px;
      padding: ${theme.spacing(0.625, 1.5)};
      text-transform: capitalize;
      
  `
);

export default NoteGovernance;
