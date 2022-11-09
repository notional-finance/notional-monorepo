import { Box } from '@mui/material';
import { Story, Meta } from '@storybook/react';
import { TradeActionTitle, TradeActionTitleProps } from './trade-action-title';

export default {
  component: TradeActionTitle,
  title: 'TradeActionTitle',
} as Meta;

const Template: Story<TradeActionTitleProps> = (args) => {
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        backgroundColor: '#F8FAFA',
      }}
    >
      <TradeActionTitle {...args} />
    </Box>
  );
};

export const Lend = Template.bind({});
Lend.args = {
  title: 'Fixed APY',
  valueSuffix: '%',
};

export const Mint = Template.bind({});
Mint.args = {
  title: 'Total APY',
  value: 10.06,
  valueSuffix: '%',
};

export const Stake = Template.bind({});
Stake.args = {
  title: 'Staking APR',
  subtitle: 'Staked NOTE holders earn incentives, NOTE re-investments, and trading fees.',
  value: 20.01,
  valueSuffix: '%',
};
