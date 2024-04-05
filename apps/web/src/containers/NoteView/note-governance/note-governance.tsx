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

interface TopCardPillProps {
  open: boolean;
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
        {govData.map((topic: any) => (
          <ContentBox key={topic.id}>
            <TopCardData>
              <Subtitle sx={{ fontWeight: 600, color: colors.white }}>
                0xCece...2eB1
              </Subtitle>
              <TopCardPill open={false} theme={theme}>
                Closed
              </TopCardPill>
            </TopCardData>
            <CardInput>{topic.title}</CardInput>
            <Subtitle
              sx={{
                marginTop: theme.spacing(2),
                marginBottom: theme.spacing(3),
              }}
            >
              Lorem ipsum dolor sit amet consectetur. Senectus arcu aliquam
              gravida in. Erat aliquam malesuada fermentum nunc purus...
            </Subtitle>
            <VoteMetrics>
              <CardCaption
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <CheckmarkIcon
                  sx={{
                    height: theme.spacing(3),
                    marginRight: theme.spacing(1.5),
                  }}
                />
                For 1.7M NOTE
              </CardCaption>
              <CardCaption>100%</CardCaption>
            </VoteMetrics>
            <VoteMetrics>
              <CardCaption
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <HighlightOffIcon
                  sx={{
                    height: theme.spacing(3),
                    fill: colors.red,
                    marginRight: theme.spacing(1.5),
                  }}
                />
                Against 0 NOTE
              </CardCaption>
              <CardCaption>0%</CardCaption>
            </VoteMetrics>
            <CardSubText>Ended 2 days ago - 174.5% quorum reached</CardSubText>
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

const TopCardPill = styled(Box)(
  ({ theme, open }: TopCardPillProps) => `
      background-color: ${open ? colors.neonTurquoise : colors.darkGreen};
      color: ${open ? colors.black : colors.greenGrey};
      border-radius: 20px;
      padding: ${theme.spacing(0.625, 1.5)};
      
  `
);

export default NoteGovernance;
