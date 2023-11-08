import { styled, useTheme, Divider } from '@mui/material';
import { StatusHeading } from '../transaction-confirmation/components/status-heading';
import { Button, Drawer } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import {
  TransactionStatus,
  BaseTradeContext,
} from '@notional-finance/notionable-hooks';
import { HeadingSubtitle } from '@notional-finance/mui';
import { useTransactionApprovals } from './hooks';
import { ApprovalButton } from './components/approval-button';
import { messages } from './messages';

export interface TransactionApprovalsProps {
  context: BaseTradeContext;
  onCancel?: () => void;
  showDrawer?: boolean;
}

export const TransactionApprovals = ({
  context,
  onCancel,
  showDrawer = true,
}: TransactionApprovalsProps) => {
  const theme = useTheme();
  const {
    state: { selectedDepositToken, depositBalance },
  } = context;

  const {
    allowanceApprovalRequired,
    variableBorrowApprovalRequired,
    tokenApprovalRequired,
    tokenApprovalTxnStatus,
    variableBorrowTxnStatus,
    enableToken,
    enablePrimeBorrow,
  } = useTransactionApprovals(selectedDepositToken || '', context);

  const inner = (
    <>
      <StatusHeading
        heading={<FormattedMessage defaultMessage={'APPROVAL PENDING '} />}
        transactionStatus={TransactionStatus.APPROVAL_PENDING}
      />
      <TermsOfService theme={theme}>
        {
          <FormattedMessage
            defaultMessage={
              'Enable your account to proceed with your transaction. You will only need to make approvals once.'
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
          symbol={selectedDepositToken ? selectedDepositToken : ''}
          callback={() => enableToken(true)}
          title={messages.tokenApproval.title}
          description={messages.tokenApproval.description}
          buttonText={messages.tokenApproval.buttonText}
        />
      )}
      {variableBorrowApprovalRequired && (
        <ApprovalButton
          showSymbol={false}
          pending={
            variableBorrowTxnStatus !== TransactionStatus.NONE &&
            variableBorrowTxnStatus !== TransactionStatus.REVERT
          }
          symbol={selectedDepositToken ? selectedDepositToken : ''}
          callback={enablePrimeBorrow}
          title={messages.variableBorrow.title}
          description={messages.variableBorrow.description}
          buttonText={messages.variableBorrow.buttonText}
        />
      )}
      {allowanceApprovalRequired && (
        <ApprovalButton
          pending={
            tokenApprovalTxnStatus !== TransactionStatus.NONE &&
            tokenApprovalTxnStatus !== TransactionStatus.REVERT
          }
          symbol={selectedDepositToken ? selectedDepositToken : ''}
          callback={() => enableToken(true)}
          title={messages.insufficientAllowance.title}
          description={messages.insufficientAllowance.description}
          buttonText={messages.insufficientAllowance.buttonText}
          depositAmount={depositBalance?.toDisplayStringWithSymbol()}
        />
      )}
      <Button
        variant="outlined"
        size="large"
        sx={{
          bottom: 0,
          position: 'fixed',
          width: '447px',
          marginBottom: '32px',
        }}
        onClick={onCancel}
      >
        <FormattedMessage defaultMessage={'Back'} />
      </Button>
    </>
  );

  return showDrawer ? <Drawer size="large">{inner}</Drawer> : inner;
};

const TermsOfService = styled(HeadingSubtitle)(
  ({ theme }) => `
      margin-top: ${theme.spacing(2)};
      margin-bottom: ${theme.spacing(3)};
      color: ${theme.palette.typography.light};
      font-size: 14px;
    `
);

export default TransactionApprovals;
