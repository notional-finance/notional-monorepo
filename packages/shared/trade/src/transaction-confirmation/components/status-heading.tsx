import { styled, Box, useTheme } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import transactionSuccessSvg from '../../icons/icon-checkmark.svg';
import transactionErrorSvg from '../../icons/icon-alert.svg';
import transactionWarningSvg from '../../icons/icon-warning.svg';
import {
  ProgressIndicator,
  LargeInputTextEmphasized,
} from '@notional-finance/mui';
import { TransactionStatus } from '@notional-finance/notionable-hooks';

const Heading = styled(LargeInputTextEmphasized)`
  margin-bottom: 1.25rem;
  display: flex;
`;

const StatusIcon = styled(Box)`
  margin-bottom: 1rem;
  width: 4rem;
  height: 4rem;
`;
interface StatusHeadingProps {
  heading: React.ReactNode;
  transactionStatus: TransactionStatus;
}

export const StatusHeading = ({
  heading,
  transactionStatus,
}: StatusHeadingProps) => {
  const theme = useTheme();
  let statusIcon;
  let headingText;

  switch (transactionStatus) {
    case TransactionStatus.WAIT_USER_CONFIRM:
      statusIcon = <ProgressIndicator type="notional" width="75" />;
      headingText = (
        <FormattedMessage defaultMessage={'Confirm Transaction in Wallet'} />
      );
      break;
    case TransactionStatus.SUBMITTED:
      statusIcon = <ProgressIndicator type="notional" width="75" />;
      headingText = <FormattedMessage defaultMessage={'Pending...'} />;
      break;
    case TransactionStatus.CONFIRMED:
      statusIcon = (
        <img
          className="status-icon"
          src={transactionSuccessSvg}
          alt="Success"
        />
      );
      headingText = (
        <FormattedMessage
          defaultMessage={'<span>Success!</span> Transaction Confirmed.'}
          values={{
            span: (msg: React.ReactNode) => (
              <Box
                style={{
                  color: theme.palette.typography.accent,
                  marginRight: theme.spacing(1),
                }}
              >
                {msg}
              </Box>
            ),
          }}
        />
      );
      break;
    case TransactionStatus.REVERT:
    case TransactionStatus.ERROR_BUILDING:
      statusIcon = (
        <img
          className="status-icon"
          src={transactionErrorSvg}
          alt="Exclamation point"
        />
      );
      headingText = (
        <Box
          sx={{
            color: theme.palette.error.main,
          }}
        >
          <FormattedMessage defaultMessage={'Error!'} />
        </Box>
      );
      break;
    case TransactionStatus.APPROVAL_PENDING:
      statusIcon = (
        <img
          className="status-icon"
          src={transactionWarningSvg}
          alt="Exclamation point"
        />
      );
      headingText = (
        <Box
          sx={{
            color: theme.palette.typography.main,
          }}
        >
          <FormattedMessage defaultMessage={'Enable to continue'} />
        </Box>
      );
      break;
    default:
      statusIcon = (
        <img
          className="status-icon"
          src={transactionSuccessSvg}
          style={{ opacity: '25%' }}
          alt="Success"
        />
      );
      headingText = (
        <>
          <FormattedMessage defaultMessage={'Confirm'} />
          &nbsp;{heading}
        </>
      );
      break;
  }

  return (
    <Box>
      <StatusIcon>{statusIcon}</StatusIcon>
      <Heading>{headingText}</Heading>
    </Box>
  );
};
