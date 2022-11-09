import { Story, Meta } from '@storybook/react';
import { ActiveBellIcon, ActiveBellIconProps } from './active-bell-icon';

export default {
  component: ActiveBellIcon,
  title: 'ActiveBellIcon',
} as Meta;

const Template: Story<ActiveBellIconProps> = (args) => <ActiveBellIcon {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
