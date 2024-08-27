import { Box, styled, useTheme } from '@mui/material';
import {
  NoteChart,
  H5,
  SectionTitle,
  DiagramTitle,
  Button,
  CardInput,
  H2,
  DateRangeButtons,
  ValidDateRanges,
} from '@notional-finance/mui';
import {
  NotePageSectionTitle,
  SubText,
  ContentBox,
  ChartSectionContainer,
  ContentContainer,
  DualColorValue,
} from '../components';
import { FormattedMessage } from 'react-intl';
import { colors } from '@notional-finance/styles';
import { TokenIcon, WalletIcon } from '@notional-finance/icons';
import { useStakedNote } from './use-staked-note';
import {
  StakedNoteData,
  useAppStore,
} from '@notional-finance/notionable-hooks';
import { FiatSymbols } from '@notional-finance/core-entities';
import { formatNumberAsPercentWithUndefined } from '@notional-finance/helpers';
import { useState } from 'react';
import { PRODUCTS, SECONDS_IN_DAY } from '@notional-finance/util';
import { observer } from 'mobx-react-lite';

interface StakedNoteProps {
  stakedNoteData: StakedNoteData | undefined;
}

const StakedNote = ({ stakedNoteData }: StakedNoteProps) => {
  const theme = useTheme();
  const [dateRange, setDateRange] = useState(ValidDateRanges[1].value);
  const { baseCurrency } = useAppStore();
  const {
    currentSNOTEPrice,
    totalSNOTEValue,
    currentSNOTEYield,
    annualizedRewardRate,
    historicalSNOTEPrice,
    walletNOTEBalances,
  } = useStakedNote(stakedNoteData, undefined, baseCurrency);

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
            data={historicalSNOTEPrice}
            baseCurrency={baseCurrency}
            formatToolTipValueAsFiat
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
            </Box>
            <Box sx={{ marginBottom: theme.spacing(4) }}>
              <Box sx={{ display: 'flex' }}>
                <H2
                  sx={{
                    color: colors.white,
                    marginRight: theme.spacing(1),
                  }}
                >
                  {formatNumberAsPercentWithUndefined(
                    currentSNOTEYield,
                    '-',
                    2
                  )}
                </H2>
                <H2 sx={{ color: colors.blueGreen }}>APY</H2>
              </Box>
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
                <DiagramTitle>
                  {annualizedRewardRate?.toDisplayStringWithSymbol(
                    0,
                    false,
                    false
                  )}
                </DiagramTitle>
              </Box>
            </Container>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginTop: theme.spacing(5),
                marginBottom: theme.spacing(2),
                visibility:
                  walletNOTEBalances === undefined ? 'hidden' : 'visible',
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
              <CardInput>{walletNOTEBalances?.toFixed(2)}</CardInput>
            </Box>
            <Button
              size="large"
              sx={{
                fontFamily: 'Avenir Next',
                cursor: 'pointer',
                width: '100%',
              }}
              to={`${PRODUCTS.STAKE_NOTE}/ETH`}
            >
              <FormattedMessage defaultMessage={'Stake NOTE'} />
            </Button>
          </ContentBox>
        </ChartSectionContainer>
        <DateRangeButtons setDateRange={setDateRange} dateRange={dateRange} />
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

export default observer(StakedNote);
