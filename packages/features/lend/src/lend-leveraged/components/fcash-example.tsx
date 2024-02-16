import { TokenIcon, EqualsIcon } from '@notional-finance/icons';
import { Body, H5 } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import { Box, styled, useTheme } from '@mui/material';

interface FCashExampleProps {
  tokenSymbol: string;
}

export const FCashExample = ({ tokenSymbol }: FCashExampleProps) => {
  const theme = useTheme();
  return (
    <>
      <BodyText>
        <FormattedMessage
          defaultMessage={`f{tokenSymbol} is a token that is redeemable for 1 {tokenSymbol} at its maturity date.`}
          values={{
            tokenSymbol,
          }}
        />
      </BodyText>
      <ImageWrapper>
        <TokenIcon symbol={`f${tokenSymbol}`} size="xxl" />
        <Box sx={{ width: '50px' }}>
          <EqualsIcon />
        </Box>
        <TokenIcon symbol={tokenSymbol} size="xxl" />
      </ImageWrapper>
      <H5
        sx={{
          color: theme.palette.typography.main,
          marginBottom: theme.spacing(2),
          textTransform: 'uppercase',
          textAlign: 'center',
        }}
      >
        <FormattedMessage
          defaultMessage={`1 f{tokenSymbol} equals 1 {tokenSymbol} at maturity`}
          values={{
            tokenSymbol,
          }}
        />
      </H5>
      <BodyText>
        <FormattedMessage
          defaultMessage={`f{tokenSymbol} trades at a discount before maturity. The amount of fixed interest you earn when lending or owe when borrowing depends on how big that discount is.`}
          values={{
            tokenSymbol,
          }}
        />
      </BodyText>
    </>
  );
};

const BodyText = styled(Body)(
  ({ theme }) => `
      margin-bottom: ${theme.spacing(2)};
    `
);

const ImageWrapper = styled(Box)(
  ({ theme }) => `
      width: 300px;
      margin: auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: ${theme.spacing(4)};
      margin-top: ${theme.spacing(4)};
      svg {
        width: 100%;
        height: 100%;
      }
    
    `
);

export default FCashExample;
