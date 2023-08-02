import { styled, Box, useTheme } from '@mui/material';
import { ExternalLinkIcon } from '@notional-finance/icons';
import { FormattedMessage } from 'react-intl';
import { getEtherscanTransactionLink } from '@notional-finance/util';
import {
  TransactionStatus,
  useSelectedNetwork,
} from '@notional-finance/notionable-hooks';

interface PendingTransactionProps {
  hash: string;
  transactionStatus: string;
}

export const PendingTransaction = ({
  hash,
  transactionStatus,
}: PendingTransactionProps) => {
  const theme = useTheme();
  const selectedNetwork = useSelectedNetwork();
  const etherscanLink = (
    <StyledLink
      href={getEtherscanTransactionLink(hash, selectedNetwork)}
      target="_blank"
      rel="noreferrer"
      className="etherscan-link"
    >
      <FormattedMessage defaultMessage={'View on Etherscan'} />
      <ExternalLinkIcon
        sx={{ marginLeft: '0.25rem', height: '1rem', marginTop: '-1px' }}
        fill={theme.palette.primary.main}
      />
    </StyledLink>
  );

  switch (transactionStatus) {
    case TransactionStatus.WAIT_USER_CONFIRM:
      return (
        <PendingContainer>
          <FormattedMessage defaultMessage={'Confirm Transaction in Wallet'} />
        </PendingContainer>
      );
    case TransactionStatus.SUBMITTED:
      return (
        <PendingContainer>
          <FormattedMessage defaultMessage={'Transaction Pending'} />: &nbsp;
          {etherscanLink}
        </PendingContainer>
      );
    case TransactionStatus.CONFIRMED:
      return (
        <ConfirmedContainer>
          <FormattedMessage defaultMessage={'Transaction Confirmed'} />: &nbsp;
          {etherscanLink}
        </ConfirmedContainer>
      );
    default:
      return null;
  }
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

const StyledLink = styled('a')`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const PendingContainer = styled(Container)(
  ({ theme }) => `
  background: ${theme.palette.background.default};
  color: ${theme.palette.common.black};

  a {
    color: ${theme.palette.primary.main};
  }
`
);

const ConfirmedContainer = styled(Container)(
  ({ theme }) => `
  background: ${theme.palette.background.accentDefault};
  opacity: 0.95;
  color: ${theme.palette.common.white};

  a {
    color: ${theme.palette.primary.accent};
  }
`
);
