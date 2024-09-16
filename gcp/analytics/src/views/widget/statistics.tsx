// material-ui
import Grid from '@mui/material/Grid';

// project imports
import ReportCard from 'components/cards/statistics/ReportCard';
import EcommerceMetrix from 'components/cards/statistics/EcommerceMetrix';
import HoverSocialCard from 'components/cards/statistics/HoverSocialCard';
import RoundIconCard from 'components/cards/statistics/RoundIconCard';
import AnalyticEcommerce from 'components/cards/statistics/AnalyticEcommerce';
import UserCountCard from 'components/cards/statistics/UserCountCard';
import LabelledTasks from 'sections/dashboard/analytics/LabelledTasks';
import ReaderCard from 'sections/dashboard/analytics/ReaderCard';

// assets
import AimOutlined from '@ant-design/icons/AimOutlined';
import BarChartOutlined from '@ant-design/icons/BarChartOutlined';
import CalendarOutlined from '@ant-design/icons/CalendarOutlined';
import ContactsOutlined from '@ant-design/icons/ContactsOutlined';
import DownloadOutlined from '@ant-design/icons/DownloadOutlined';
import DollarCircleFilled from '@ant-design/icons/DollarCircleFilled';
import ScheduleFilled from '@ant-design/icons/ScheduleFilled';
import ShoppingFilled from '@ant-design/icons/ShoppingFilled';
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import FacebookOutlined from '@ant-design/icons/FacebookOutlined';
import FileTextOutlined from '@ant-design/icons/FileTextOutlined';
import FileProtectOutlined from '@ant-design/icons/FileProtectOutlined';
import FieldTimeOutlined from '@ant-design/icons/FieldTimeOutlined';
import LinkedinOutlined from '@ant-design/icons/LinkedinOutlined';
import RedditOutlined from '@ant-design/icons/RedditOutlined';
import TwitterOutlined from '@ant-design/icons/TwitterOutlined';
import YoutubeOutlined from '@ant-design/icons/YoutubeOutlined';

// ===========================|| WIDGET - STATISTICS ||=========================== //

export default function WidgetStatistics() {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} lg={3} sm={6}>
        <ReportCard primary="$30200" secondary="All Earnings" color="secondary.main" iconPrimary={BarChartOutlined} />
      </Grid>
      <Grid item xs={12} lg={3} sm={6}>
        <ReportCard primary="145" secondary="Task" color="error.main" iconPrimary={CalendarOutlined} />
      </Grid>
      <Grid item xs={12} lg={3} sm={6}>
        <ReportCard primary="290+" secondary="Page Views" color="success.dark" iconPrimary={FileTextOutlined} />
      </Grid>
      <Grid item xs={12} lg={3} sm={6}>
        <ReportCard primary="500" secondary="Downloads" color="primary.main" iconPrimary={DownloadOutlined} />
      </Grid>

      <Grid item xs={12} lg={4} sm={6}>
        <EcommerceMetrix
          primary="Revenue"
          secondary="$4,500"
          content="$50,032 Last Month"
          color="primary.main"
          iconPrimary={DollarCircleFilled}
        />
      </Grid>
      <Grid item xs={12} lg={4} sm={6}>
        <EcommerceMetrix
          primary="Orders Received"
          secondary="486"
          content="20% Increase"
          color="warning.main"
          iconPrimary={ScheduleFilled}
        />
      </Grid>
      <Grid item xs={12} lg={4} sm={12}>
        <EcommerceMetrix
          primary="Total Sales"
          secondary="1641"
          content="$1,055 Revenue Generated"
          color="success.main"
          iconPrimary={ShoppingFilled}
        />
      </Grid>

      <Grid item xs={12} lg={3} sm={6}>
        <HoverSocialCard primary="Facebook Users" secondary="1165 +" iconPrimary={FacebookOutlined} color="primary.main" />
      </Grid>
      <Grid item xs={12} lg={3} sm={6}>
        <HoverSocialCard primary="Twitter Users" secondary="780 +" iconPrimary={TwitterOutlined} color="info.main" />
      </Grid>
      <Grid item xs={12} lg={3} sm={6}>
        <HoverSocialCard primary="Linked In Users" secondary="998 +" iconPrimary={LinkedinOutlined} color="secondary.A300" />
      </Grid>
      <Grid item xs={12} lg={3} sm={6}>
        <HoverSocialCard primary="Youtube Videos" secondary="650 +" iconPrimary={YoutubeOutlined} color="error.main" />
      </Grid>

      <Grid item xs={12} lg={4} sm={6}>
        <RoundIconCard
          primary="Impressions"
          secondary="1,563"
          content="May 23 - June 01 (2018)"
          iconPrimary={EyeOutlined}
          color="primary.main"
          bgcolor="primary.lighter"
        />
      </Grid>
      <Grid item xs={12} lg={4} sm={6}>
        <RoundIconCard
          primary="Goal"
          secondary="30,564"
          content="May 28 - June 01 (2018)"
          iconPrimary={AimOutlined}
          color="success.main"
          bgcolor="success.lighter"
        />
      </Grid>
      <Grid item xs={12} lg={4} md={12}>
        <RoundIconCard
          primary="Impact"
          secondary="42.6%"
          content="May 30 - June 01 (2018)"
          iconPrimary={FieldTimeOutlined}
          color="warning.main"
          bgcolor="warning.lighter"
        />
      </Grid>

      <Grid item xs={12} sm={6} md={4} lg={3}>
        <AnalyticEcommerce title="Total Page Views" count="4,42,236" percentage={59.3} extra="35,000" />
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <AnalyticEcommerce title="Total Users" count="78,250" percentage={70.5} color="success" extra="8,900" />
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <AnalyticEcommerce title="Total Order" count="18,800" percentage={27.4} isLoss color="warning" extra="1,943" />
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <AnalyticEcommerce title="Total Sales" count="$35,078" percentage={27.4} isLoss color="error" extra="$20,395" />
      </Grid>

      <Grid item xs={12} lg={4}>
        <UserCountCard primary="Daily user" secondary="1,658" iconPrimary={ContactsOutlined} color="success.light" />
      </Grid>
      <Grid item xs={12} lg={4} sm={6}>
        <UserCountCard primary="Daily page view" secondary="1K" iconPrimary={FileProtectOutlined} color="primary.main" />
      </Grid>
      <Grid item xs={12} lg={4} sm={6}>
        <UserCountCard primary="Last month visitor" secondary="5,678" iconPrimary={RedditOutlined} color="warning.dark" />
      </Grid>

      <Grid item xs={12} md={8} lg={7}>
        <ReaderCard />
      </Grid>
      <Grid item xs={12} md={4} lg={5}>
        <LabelledTasks />
      </Grid>
    </Grid>
  );
}
