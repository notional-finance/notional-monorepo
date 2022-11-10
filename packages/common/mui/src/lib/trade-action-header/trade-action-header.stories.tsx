import { Story, Meta } from '@storybook/react';
import { TradeActionHeader, TradeActionHeaderProps } from './trade-action-header';

export default {
  component: TradeActionHeader,
  title: 'TradeActionHeader',
} as Meta;

const Template: Story<TradeActionHeaderProps> = (args) => <TradeActionHeader {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  token: 'NOTE',
  actionText: 'Lend',
};
