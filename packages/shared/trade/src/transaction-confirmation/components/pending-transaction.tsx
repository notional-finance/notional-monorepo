import { useState, useEffect } from 'react';
import { styled, Box, useTheme, alpha } from '@mui/material';
import { ExternalLinkIcon, CopyIcon } from '@notional-finance/icons';
import { FormattedMessage } from 'react-intl';
import { getEtherscanTransactionLink } from '@notional-finance/util';
import { colors } from '@notional-finance/styles';
import { truncateAddress } from '@notional-finance/helpers';
import { CopyCaption } from '@notional-finance/mui';
import { Network } from '@notional-finance/util';
import { TransactionStatus } from '@notional-finance/notionable-hooks';
import { NotionalTheme } from '@notional-finance/styles';
import { trackOutboundLink } from '@notional-finance/helpers';

interface PendingTransactionProps {
  hash: string;
  transactionStatus: string;
  selectedNetwork: Network | undefined;
}
interface ContainerProps {
  transactionStatus: string;
  theme: NotionalTheme;
}

export const PendingTransaction = ({
  hash,
  transactionStatus,
  selectedNetwork,
}: PendingTransactionProps) => {
  const theme = useTheme();
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const txnLink = getEtherscanTransactionLink(hash, selectedNetwork);

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
              marginBottom: theme.spacing(2),
              whiteSpace: 'nowrap',
              color: theme.palette.typography.main,
            }}
          >
            <Box>
              {transactionStatus === TransactionStatus.CONFIRMED ? (
                <FormattedMessage
                  defaultMessage={
                    'Check your <a1> confirmed </a1> transaction:'
                  }
                  values={{
                    a1: (msg: React.ReactNode) => (
                      <Box component="span" sx={{ fontWeight: 600 }}>
                        {msg}
                      </Box>
                    ),
                  }}
                />
              ) : (
                <FormattedMessage
                  defaultMessage={'Check the status of your transaction:'}
                />
              )}
            </Box>
            <StyledLink
              href={txnLink}
              target="_blank"
              rel="noreferrer"
              className="etherscan-link"
              onClick={() => trackOutboundLink(txnLink)}
            >
              <Box
                sx={{
                  textDecoration: 'underline',
                  color: theme.palette.typography.accent,
                }}
              >
                {selectedNetwork === Network.arbitrum ? (
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
              whiteSpace: 'nowrap',
              color: theme.palette.typography.main,
            }}
          >
            <FormattedMessage defaultMessage={'Transaction Hash:'} />
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
              <CopyCaption
                title={<FormattedMessage defaultMessage="Hash Copied" />}
                showAlert={showAlert}
              />
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
  padding: ${theme.spacing(1.25)};
  margin-top: ${theme.spacing(4)};
  margin-bottom: ${theme.spacing(2.5)};
  display: flex;
  justify-content: center;
  align-items: center;

  img {
    margin-left: ${theme.spacing(1.25)};
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
  shouldForwardProp: (prop: string) => prop !== 'transactionStatus',
})(
  ({ transactionStatus, theme }: ContainerProps) => `
  background: ${
    transactionStatus === TransactionStatus.CONFIRMED
      ? alpha(colors.aqua, 0.1)
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
