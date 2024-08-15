import { Box, styled, useTheme } from '@mui/material';
import {
  NotePageSectionTitle,
  PercentAndDate,
  ChartSectionContainer,
  ContentContainer,
  DualColorValue,
  SubText,
  ContentBox,
} from '../components';
import { FormattedMessage } from 'react-intl';
import {
  Caption,
  ExternalLink,
  Button,
  H5,
  NoteChart,
  H2,
  DateRangeButtons,
  ValidDateRanges,
} from '@notional-finance/mui';
import { ReactNode, useState } from 'react';
import { TokenIcon } from '@notional-finance/icons';
import { colors } from '@notional-finance/styles';
import {
  NoteSupplyData,
  useNotePrice,
} from '@notional-finance/notionable-hooks';
import { useNoteSupply } from './use-note-supply';
import { useAppState } from '@notional-finance/notionable-hooks';

interface NoteSummaryProps {
  noteSupplyData: NoteSupplyData | undefined;
}

export const NoteSummary = ({ noteSupplyData }: NoteSummaryProps) => {
  const theme = useTheme();
  const { notePrice, notePriceChange } = useNotePrice();
  const [dateRange, setDateRange] = useState(ValidDateRanges[1].value);
  const { baseCurrency } = useAppState();
  const {
    noteBurnChart,
    totalNoteBurned,
    annualNOTEBurnRate,
    annualNOTEBurnPercentage,
  } = useNoteSupply(noteSupplyData, dateRange);

  const currentDateRange = ValidDateRanges.find(
    (range) => range.value === dateRange
  );

  return (
    <ContentContainer id="note-summary">
      <NotePageSectionTitle
        title={<FormattedMessage defaultMessage={'NOTE'} />}
        symbol="note"
      />
      <SubText>
        <FormattedMessage
          defaultMessage={
            'Track the NOTE buy and burn. Protocol owned tokens are converted into NOTE and burned each week according to <a1>NIP-70</a1>.'
          }
          values={{
            a1: (msg: ReactNode) => (
              <ExternalLink
                accent
                textDecoration
                href="https://forum.notional.finance/t/nip-70-plan-to-manage-notional-v3-reserves-and-conduct-periodic-note-burns/173"
              >
                {msg}
              </ExternalLink>
            ),
          }}
        />
      </SubText>
      <ChartSectionContainer>
        <NoteChart
          // option={option}
          data={noteBurnChart}
          title={<FormattedMessage defaultMessage={'Total NOTE Burned'} />}
          largeValue={<DualColorValue value={totalNoteBurned || 0} />}
        />
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            gap: theme.spacing(3),
          }}
        >
          <ContentBox sx={{ height: 'fit-content' }}>
            <Box
              sx={{
                display: 'flex',
                marginBottom: theme.spacing(2),
                justifyContent: 'space-between',
              }}
            >
              <H5>
                <FormattedMessage defaultMessage={'NOTE Burn Rate'} />
              </H5>
              <PercentAndDate
                percentChange={annualNOTEBurnPercentage || 0}
                dateRange={`(${currentDateRange?.displayValue})`}
              />
            </Box>
            <DualColorValue
              value={annualNOTEBurnRate?.toFloat() || 0}
              suffix="/ yr"
            />
            <Caption>
              {annualNOTEBurnRate
                ?.toFiat(baseCurrency)
                .toDisplayStringWithSymbol(2, false, false)}
            </Caption>
          </ContentBox>
          <ContentBox>
            <Box
              sx={{
                display: 'flex',
                marginBottom: theme.spacing(2),
                justifyContent: 'space-between',
              }}
            >
              <H5>
                <FormattedMessage defaultMessage={'NOTE Price'} />
              </H5>
              <PercentAndDate
                percentChange={notePriceChange}
                dateRange="(24h)"
              />
            </Box>
            <H2 sx={{ display: 'flex', alignItems: 'center' }}>
              <TokenIcon
                symbol="note"
                size="large"
                style={{ marginRight: theme.spacing(1) }}
              />
              {notePrice
                ?.toFiat(baseCurrency)
                .toDisplayStringWithSymbol(4, false, false)}
            </H2>
            <ButtonContainer>
              <Button
                size="large"
                sx={{
                  fontFamily: 'Avenir Next',
                  cursor: 'pointer',
                  width: theme.spacing(22.5),
                  border: `1px solid ${colors.neonTurquoise}`,
                  ':hover': {
                    background: colors.matteGreen,
                  },
                }}
                variant="outlined"
                href="https://www.coingecko.com/en/coins/notional-finance"
              >
                CoinGecko
              </Button>
              <Button
                size="large"
                sx={{
                  fontFamily: 'Avenir Next',
                  cursor: 'pointer',
                  width: theme.spacing(22.5),
                }}
                href="https://matcha.xyz/tokens/ethereum/0xcfeaead4947f0705a14ec42ac3d44129e1ef3ed5"
              >
                <FormattedMessage defaultMessage={'Trade NOTE'} />
              </Button>
            </ButtonContainer>
          </ContentBox>
        </Box>
      </ChartSectionContainer>
      <DateRangeButtons setDateRange={setDateRange} dateRange={dateRange} />
    </ContentContainer>
  );
};

const ButtonContainer = styled(Box)(
  ({ theme }) => `
  margin-top: ${theme.spacing(3)};
  display: flex;
  justify-content: space-between;
  ${theme.breakpoints.down('sm')} {
    flex-direction: column;
    gap: ${theme.spacing(2)};
    align-items: center;
    button {
      width: ${theme.spacing(36.75)};
    }
  }
  `
);

export default NoteSummary;
