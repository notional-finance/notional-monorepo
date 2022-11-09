import { Story, Meta } from '@storybook/react';
import { DashboardIcon, DashboardIconProps } from './dashboard-icon';

export default {
  component: DashboardIcon,
  title: 'DashboardIcon',
} as Meta;

const Template: Story<DashboardIconProps> = (args) => <DashboardIcon {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
