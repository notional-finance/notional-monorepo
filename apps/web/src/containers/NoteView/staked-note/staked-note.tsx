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
import { useStakedNoteData } from './use-staked-note-data';
import { useFiat } from '@notional-finance/notionable-hooks';
import { FiatSymbols } from '@notional-finance/core-entities';

export const StakedNote = () => {
  const theme = useTheme();
  const baseCurrency = useFiat();
  const { currentSNOTEPrice, totalSNOTEValue, currentSNOTEYield } =
    useStakedNoteData();
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
            data={[]}
            title={<FormattedMessage defaultMessage={'sNOTE Price'} />}
            largeValue={
              <DualColorValue
                prefix={FiatSymbols[baseCurrency]}
                value={currentSNOTEPrice?.toFiat(baseCurrency).toFloat() || 0}
              />
            }
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
                <FormattedMessage defaultMessage={'sNOTE APY'} />
              </H5>
              <PercentAndDate percentChange={3.26} dateRange="(30d)" />
            </Box>
            <Box sx={{ marginBottom: theme.spacing(4) }}>
              <DualColorValue value={currentSNOTEYield || 0} suffix="APY" />
            </Box>
            <Container>
              <Box>
                <SectionTitle sx={{ marginBottom: theme.spacing(0.5) }}>
                  <FormattedMessage defaultMessage={'Total sNOTE Value'} />
                </SectionTitle>
                <DiagramTitle>
                  {totalSNOTEValue?.toDisplayStringWithSymbol(0, false, false)}
                </DiagramTitle>
              </Box>
              <Box>
                <SectionTitle sx={{ marginBottom: theme.spacing(0.5) }}>
                  <FormattedMessage defaultMessage={'Annual Reward Rate'} />
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
