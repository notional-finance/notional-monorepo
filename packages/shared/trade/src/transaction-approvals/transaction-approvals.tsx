import { useTheme, Divider } from '@mui/material';
import { StatusHeading } from '../transaction-confirmation/components/status-heading';
import { Button, ScrollToTop } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import {
  TransactionStatus,
  BaseTradeContext,
} from '@notional-finance/notionable-hooks';
import { TermsOfService } from '../transaction-confirmation/transaction-confirmation';
import { ApprovalButton } from './components/approval-button';
import { messages } from './messages';

export interface TransactionApprovalsProps {
  context: BaseTradeContext;
  onCancel?: () => void;
  allowanceIncreaseRequired?: boolean;
  secondaryTokenApprovalRequired?: boolean;
  variableBorrowApprovalRequired?: boolean;
  tokenApprovalRequired?: boolean;
  tokenApprovalTxnStatus?: TransactionStatus;
  secondaryTokenApprovalTxnStatus?: TransactionStatus;
  variableBorrowTxnStatus?: TransactionStatus;
  enableToken: (approve: boolean) => Promise<void>;
  secondaryEnableToken: (approve: boolean) => Promise<void>;
  enablePrimeBorrow: () => void;
}

export const TransactionApprovals = ({
  context,
  onCancel,
  allowanceIncreaseRequired,
  secondaryTokenApprovalRequired,
  variableBorrowApprovalRequired,
  tokenApprovalRequired,
  tokenApprovalTxnStatus,
  secondaryTokenApprovalTxnStatus,
  variableBorrowTxnStatus,
  enableToken,
  enablePrimeBorrow,
  secondaryEnableToken,
}: TransactionApprovalsProps) => {
  const theme = useTheme();
  const {
    state: { depositBalance, secondaryDepositBalance },
  } = context;

  return (
    <>
      <ScrollToTop />
      <StatusHeading
        heading={<FormattedMessage defaultMessage={'APPROVAL PENDING '} />}
        transactionStatus={TransactionStatus.APPROVAL_PENDING}
      />
      <TermsOfService theme={theme}>
        {
          <FormattedMessage
            defaultMessage={
              'Enable your account to proceed with your transaction.'
            }
          />
        }
      </TermsOfService>
      <Divider
        variant="fullWidth"
        sx={{ background: 'white', marginBottom: theme.spacing(6) }}
      />
      {tokenApprovalRequired && (
        <ApprovalButton
          pending={
            tokenApprovalTxnStatus !== TransactionStatus.NONE &&
            tokenApprovalTxnStatus !== TransactionStatus.REVERT
          }
          symbol={depositBalance ? depositBalance.symbol : ''}
          callback={() => enableToken(true)}
          title={messages.tokenApproval.title}
          description={messages.tokenApproval.description}
          buttonText={messages.tokenApproval.buttonText}
        />
      )}
      {secondaryTokenApprovalRequired && (
        <ApprovalButton
          pending={
            secondaryTokenApprovalTxnStatus !== TransactionStatus.NONE &&
            secondaryTokenApprovalTxnStatus !== TransactionStatus.REVERT
          }
          symbol={secondaryDepositBalance ? secondaryDepositBalance.symbol : ''}
          callback={() => secondaryEnableToken(true)}
          title={messages.tokenApproval.title}
          description={messages.tokenApproval.description}
          buttonText={messages.tokenApproval.buttonText}
        />
      )}
      {allowanceIncreaseRequired && (
        <ApprovalButton
          pending={
            tokenApprovalTxnStatus !== TransactionStatus.NONE &&
            tokenApprovalTxnStatus !== TransactionStatus.REVERT
          }
          symbol={depositBalance ? depositBalance.symbol : ''}
          callback={() => enableToken(true)}
          title={messages.insufficientAllowance.title}
          description={messages.insufficientAllowance.description}
          buttonText={messages.insufficientAllowance.buttonText}
          descriptionValues={{
            depositAmount: depositBalance?.toDisplayStringWithSymbol(),
          }}
        />
      )}
      {variableBorrowApprovalRequired && (
        <ApprovalButton
          showSymbol={false}
          pending={
            variableBorrowTxnStatus !== TransactionStatus.NONE &&
            variableBorrowTxnStatus !== TransactionStatus.REVERT
          }
          symbol={''}
          callback={enablePrimeBorrow}
          title={messages.variableBorrow.title}
          description={messages.variableBorrow.description}
          buttonText={messages.variableBorrow.buttonText}
        />
      )}
      <Button
        variant="outlined"
        size="large"
        sx={{
          bottom: 0,
          position: 'fixed',
          width: '447px',
          marginBottom: theme.spacing(4),
        }}
        onClick={onCancel}
      >
        <FormattedMessage defaultMessage={'Back'} />
      </Button>
    </>
  );
};

export default TransactionApprovals;
