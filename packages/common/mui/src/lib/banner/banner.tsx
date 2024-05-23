import { Box, styled, useTheme } from '@mui/material';
import { TokenIcon } from '@notional-finance/icons';
import { Link } from 'react-router-dom';
import { FormattedMessage, MessageDescriptor } from 'react-intl';
import { H2, Paragraph } from '../typography/typography';
import { Button } from '../button/button';

interface BannerProps {
  link?: string;
  messages?: {
    promptText: MessageDescriptor;
    buttonText: MessageDescriptor;
  };
  title?: MessageDescriptor;
  callback?: () => void;
  tokenSymbol?: string;
  buttonSuffix?: string;
}

export const Banner = ({
  link,
  messages,
  title,
  buttonSuffix,
  callback,
  tokenSymbol,
}: BannerProps) => {
  const theme = useTheme();
  return (
    <BannerContainer>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {tokenSymbol && <TokenIcon symbol={tokenSymbol} size={'xxl'} />}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            marginLeft: theme.spacing(3),
          }}
        >
          <H2>
            <FormattedMessage {...title} />
          </H2>
          <Paragraph msg={messages?.promptText} sx={{ flex: 1 }} />
        </Box>
      </Box>
      {!callback && link && messages?.buttonText && (
        <Link to={link}>
          <Button variant="contained" size="large">
            <FormattedMessage {...messages?.buttonText} />
            {buttonSuffix}
          </Button>
        </Link>
      )}
    </BannerContainer>
  );
};

const BannerContainer = styled(Box)(
  ({ theme }) => `
    display: flex;
    background: ${theme.palette.info.light};
    padding: ${theme.spacing(4)};
    align-items: center;
    justify-content: space-between;
    margin-top: ${theme.spacing(6)};
    border-radius: ${theme.shape.borderRadius()};
    height: fit-content;
    width: 100%;
    ${theme.breakpoints.down('sm')} {
      flex-direction: column;
      p {
        margin-bottom: ${theme.spacing(2)};
      }
    }
  `
);

export default Banner;
