import { Box, styled, useTheme } from '@mui/material';
import {
  NoteChart,
  H5,
  SectionTitle,
  DiagramTitle,
  Button,
  CardInput,
} from '@notional-finance/mui';
import {
  NotePageSectionTitle,
  SubText,
  ContentBox,
  PercentAndDate,
  ChartSectionContainer,
  ContentContainer,
  DualColorValue,
} from '../components';
import { FormattedMessage } from 'react-intl';
import { colors } from '@notional-finance/styles';
import { TokenIcon, WalletIcon } from '@notional-finance/icons';

export const StakedNote = () => {
  const theme = useTheme();
  return (
    <ContentContainer id="staked-note">
      <NotePageSectionTitle
        title={<FormattedMessage defaultMessage={'sNOTE'} />}
        symbol="snote"
      />
      <SubText>
        <FormattedMessage
          defaultMessage={
            'Stake your NOTE to receive sNOTE and earn liquidity fees and reinvestment rewards. NOTE stakers provide liquidity for NOTE on Balancer and backstop the Notional protocol.'
          }
        />
      </SubText>
      <Box>
        <ChartSectionContainer>
          <NoteChart
            // option={option}
            title={<FormattedMessage defaultMessage={'sNOTE Price'} />}
            largeValue={<DualColorValue valueOne={'$20'} valueTwo={'.45'} />}
          />
          <ContentBox>
            <Box
              sx={{
                display: 'flex',
                marginBottom: theme.spacing(2),
                justifyContent: 'space-between',
              }}
            >
              <H5>
                <FormattedMessage defaultMessage={'snote yield'} />
              </H5>
              <PercentAndDate apy="+3.26%" dateRange="(30d)" />
            </Box>
            <Box sx={{ marginBottom: theme.spacing(4) }}>
              <DualColorValue
                valueOne={'22.31%'}
                valueTwo={'APY'}
                separateValues
              />
            </Box>
            <Container>
              <Box>
                <SectionTitle sx={{ marginBottom: theme.spacing(0.5) }}>
                  <FormattedMessage defaultMessage={'Total snote Value'} />
                </SectionTitle>
                <DiagramTitle>$2,385,838</DiagramTitle>
              </Box>
              <Box>
                <SectionTitle sx={{ marginBottom: theme.spacing(0.5) }}>
                  <FormattedMessage defaultMessage={'annual reward rate'} />
                </SectionTitle>
                <DiagramTitle>$388,000</DiagramTitle>
              </Box>
            </Container>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginTop: theme.spacing(5),
                marginBottom: theme.spacing(2),
              }}
            >
              <Box sx={{ marginRight: theme.spacing(2) }}>
                <WalletIcon fill={colors.greenGrey} />
                <TokenIcon
                  symbol="note"
                  size="small"
                  style={{
                    position: 'absolute',
                    marginLeft: `-${theme.spacing(1.25)}`,
                    marginTop: theme.spacing(1.625),
                  }}
                />
              </Box>

              <CardInput>10,000.21</CardInput>
            </Box>
            <Button
              size="large"
              sx={{
                fontFamily: 'Avenir Next',
                cursor: 'pointer',
                width: '100%',
              }}
              to="/stake"
            >
              <FormattedMessage defaultMessage={'Stake NOTE'} />
            </Button>
          </ContentBox>
        </ChartSectionContainer>
      </Box>
    </ContentContainer>
  );
};

const Container = styled(Box)(
  ({ theme }) => `
  background: ${colors.darkGreen};
  border-radius: ${theme.shape.borderRadius()};
  width: 100%;
  padding: ${theme.spacing(2, 3)};
  text-align: left;
  display: flex;
  justify-content: space-between;

  ${theme.breakpoints.down('sm')} {
    flex-direction: column;
    gap: ${theme.spacing(2)};
  }
  `
);

export default StakedNote;