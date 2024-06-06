import { Box, styled, useTheme } from '@mui/material';
import { TokenIcon } from '@notional-finance/icons';
import { Link } from 'react-router-dom';
import { FormattedMessage, MessageDescriptor } from 'react-intl';
import { H4, Paragraph } from '../typography/typography';
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
  imgSrc?: any;
}

export const Banner = ({
  link,
  messages,
  title,
  buttonSuffix,
  callback,
  tokenSymbol,
  imgSrc,
}: BannerProps) => {
  const theme = useTheme();
  return (
    <BannerContainer>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {tokenSymbol && <TokenIcon symbol={tokenSymbol} size={'xl'} />}
        {imgSrc && (
          <img
            src={imgSrc}
            alt="connect wallet"
            style={{ height: theme.spacing(6), width: theme.spacing(6) }}
          />
        )}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            marginLeft: theme.spacing(3),
          }}
        >
          <H4 sx={{ marginBottom: theme.spacing(0.5) }}>
            <FormattedMessage {...title} />
          </H4>
          <Paragraph msg={messages?.promptText} sx={{ flex: 1 }} />
        </Box>
      </Box>
      {!callback && link && messages?.buttonText && (
        <Link to={link}>
          <Button variant="contained" size="medium">
            <FormattedMessage {...messages?.buttonText} />
            {buttonSuffix}
          </Button>
        </Link>
      )}
      {callback && !link && messages?.buttonText && (
        <Button variant="contained" size="medium" onClick={() => callback()}>
          <FormattedMessage {...messages?.buttonText} />
          {buttonSuffix}
        </Button>
      )}
    </BannerContainer>
  );
};

const BannerContainer = styled(Box)(
  ({ theme }) => `
    display: flex;
    background: ${theme.palette.info.light};
    padding: ${theme.spacing(3)};
    align-items: center;
    justify-content: space-between;
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
