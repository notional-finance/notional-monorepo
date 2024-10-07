// material-ui
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

// project import
import MainCard from 'components/MainCard';
import Avatar from 'components/@extended/Avatar';

//asset
import CloseCircleFilled from '@ant-design/icons/CloseCircleFilled';
import DollarCircleFilled from '@ant-design/icons/DollarCircleFilled';
import FileTextFilled from '@ant-design/icons/FileTextFilled';
import HourglassFilled from '@ant-design/icons/HourglassFilled';
import ReconciliationFilled from '@ant-design/icons/ReconciliationFilled';
import ShoppingFilled from '@ant-design/icons/ShoppingFilled';

// ==============================|| INVOICE - ICONS ||============================== //

export default function InvoiceCard({ children }: any) {
  return (
    <MainCard sx={{ height: '100%' }}>
      <Grid container spacing={3}>
        <Grid item xs={4} sm={2} lg={6}>
          <MainCard content={false} boxShadow sx={{ py: 2.5 }}>
            <Stack alignItems="center" spacing={2}>
              <Avatar size="md" type="filled">
                <FileTextFilled />
              </Avatar>
              <Typography variant="subtitle1" color="secondary">
                All Invoices
              </Typography>
            </Stack>
          </MainCard>
        </Grid>
        <Grid item xs={4} sm={2} lg={6}>
          <MainCard boxShadow>
            <Stack alignItems="center" spacing={2}>
              <Avatar size="md" type="filled" color="info">
                <ReconciliationFilled />
              </Avatar>
              <Typography variant="subtitle1" color="secondary">
                Reports
              </Typography>
            </Stack>
          </MainCard>
        </Grid>
        <Grid item xs={4} sm={2} lg={6}>
          <MainCard boxShadow>
            <Stack alignItems="center" spacing={2}>
              <Avatar size="md" type="filled" color="success">
                <DollarCircleFilled />
              </Avatar>
              <Typography variant="subtitle1" color="secondary">
                Paid
              </Typography>
            </Stack>
          </MainCard>
        </Grid>
        <Grid item xs={4} sm={2} lg={6}>
          <MainCard boxShadow>
            <Stack alignItems="center" spacing={2}>
              <Avatar size="md" type="filled" color="warning">
                <HourglassFilled />
              </Avatar>
              <Typography variant="subtitle1" color="secondary">
                Pending
              </Typography>
            </Stack>
          </MainCard>
        </Grid>
        <Grid item xs={4} sm={2} lg={6}>
          <MainCard boxShadow>
            <Stack alignItems="center" spacing={2}>
              <Avatar size="md" type="filled" color="error">
                <CloseCircleFilled />
              </Avatar>
              <Typography variant="subtitle1" color="secondary">
                Cancelled
              </Typography>
            </Stack>
          </MainCard>
        </Grid>
        <Grid item xs={4} sm={2} lg={6}>
          <MainCard boxShadow>
            <Stack alignItems="center" spacing={2}>
              <Avatar size="md" type="filled">
                <ShoppingFilled />
              </Avatar>
              <Typography variant="subtitle1" color="secondary">
                Draft
              </Typography>
            </Stack>
          </MainCard>
        </Grid>
      </Grid>
    </MainCard>
  );
}
