import { useState, useEffect } from 'react';
import { styled, Box, useTheme } from '@mui/material';
import { ExternalLinkIcon, CopyIcon } from '@notional-finance/icons';
import { FormattedMessage } from 'react-intl';
import { getEtherscanTransactionLink } from '@notional-finance/util';
import { truncateAddress } from '@notional-finance/helpers';
import { Caption } from '@notional-finance/mui';
import { Network } from '@notional-finance/util';
import {
  TransactionStatus,
  useSelectedNetwork,
} from '@notional-finance/notionable-hooks';
import { NotionalTheme } from '@notional-finance/styles';

interface PendingTransactionProps {
  hash: string;
  transactionStatus: string;
}
interface ContainerProps {
  transactionStatus: string;
  theme: NotionalTheme;
}

export const PendingTransaction = ({
  hash,
  transactionStatus,
}: PendingTransactionProps) => {
  const theme = useTheme();
  const selectedNetwork = useSelectedNetwork();
  const [showAlert, setShowAlert] = useState<boolean>(false);

  useEffect(() => {
    if (showAlert) {
      setTimeout(() => {
        setShowAlert(false);
      }, 1000);
    }
  }, [showAlert, setShowAlert]);

  const handleCopy = () => {
    navigator.clipboard.writeText(hash);
    setShowAlert(true);
  };

  return (
    <Box>
      {TransactionStatus.WAIT_USER_CONFIRM === transactionStatus ? (
        <PendingContainer>
          <FormattedMessage defaultMessage={'Confirm Transaction in Wallet'} />
        </PendingContainer>
      ) : (
        <ConfirmedContainer theme={theme} transactionStatus={transactionStatus}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              width: '100%',
              marginBottom: '16px',
            }}
          >
            <Box
              sx={{
                whiteSpace: 'nowrap',
                color: theme.palette.typography.main,
              }}
            >
              <FormattedMessage
                defaultMessage={'Check the status of your transaction:'}
              />
            </Box>
            <StyledLink
              href={getEtherscanTransactionLink(hash, selectedNetwork)}
              target="_blank"
              rel="noreferrer"
              className="etherscan-link"
            >
              <Box
                sx={{
                  textDecoration: 'underline',
                  color: theme.palette.typography.accent,
                }}
              >
                {selectedNetwork === Network.ArbitrumOne ? (
                  <FormattedMessage defaultMessage={'Arbiscan'} />
                ) : (
                  <FormattedMessage defaultMessage={'Etherscan'} />
                )}
              </Box>
              <ExternalLinkIcon
                sx={{
                  marginLeft: '0.25rem',
                  height: '1rem',
                  marginTop: '-1px',
                  fill: theme.palette.typography.accent,
                }}
              />
            </StyledLink>
          </Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              width: '100%',
            }}
          >
            <Box
              sx={{
                whiteSpace: 'nowrap',
                color: theme.palette.typography.main,
              }}
            >
              <FormattedMessage defaultMessage={'Transaction Hash:'} />
            </Box>
            <Box
              sx={{
                whiteSpace: 'nowrap',
                textDecoration: 'underline',
                textDecorationColor: theme.palette.typography.accent,
                color: theme.palette.typography.accent,
                fontSize: '14px',
                cursor: 'pointer',
              }}
              onClick={handleCopy}
            >
              {truncateAddress(hash)}
              <CopyIcon
                fill={theme.palette.typography.accent}
                sx={{
                  marginLeft: '0.25rem',
                  height: '1rem',
                  marginTop: '-1px',
                }}
              />
              <Caption
                sx={{
                  background: theme.palette.background.paper,
                  color: theme.palette.typography.main,
                  padding: theme.spacing(1.5),
                  position: 'absolute',
                  borderRadius: theme.shape.borderRadius(),
                  border: `1px solid ${theme.palette.primary.light}`,
                  transition: 'all 0.3s ease-in-out',
                  opacity: showAlert ? 1 : 0,
                }}
              >
                <FormattedMessage defaultMessage="Hash Copied" />
              </Caption>
            </Box>
          </Box>
        </ConfirmedContainer>
      )}
    </Box>
  );
};

const Container = styled(Box)(
  ({ theme }) => `
  border-radius: ${theme.shape.borderRadius()};
  padding: 0.675rem;
  margin-top: 2rem;
  margin-bottom: 1.25rem;
  display: flex;
  justify-content: center;
  align-items: center;

  img {
    margin-left: 0.675rem;
    position: relative;
    top: 1px;
  }
`
);

const StyledLink = styled('a')(
  `
  display: flex;
  justify-content: center;
  align-items: center;
`
);

const PendingContainer = styled(Container)(
  ({ theme }) => `
  background: ${theme.palette.background.default};
  color: ${theme.palette.common.black};

  a {
    color: ${theme.palette.primary.main};
  }
`
);

const ConfirmedContainer = styled(Container, {
  shouldForwardProp: (prop: string) => prop !== 'hovered',
})(
  ({ transactionStatus, theme }: ContainerProps) => `
  background: ${
    transactionStatus === TransactionStatus.CONFIRMED
      ? 'rgba(19, 187, 194, 0.15)'
      : theme.palette.background.default
  };
  border: 1px solid ${
    transactionStatus === TransactionStatus.CONFIRMED
      ? theme.palette.primary.accent
      : 'transparent'
  };
  opacity: 0.95;
  color: ${theme.palette.common.white};
  padding: ${theme.spacing(3)};
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  a {
    color: ${theme.palette.primary.accent};
  }
`
);
