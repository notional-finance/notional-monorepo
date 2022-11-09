import { Story, Meta } from '@storybook/react';
import NotificationsSideDrawer from './notifications-side-drawer';

export default {
  component: NotificationsSideDrawer,
  title: 'Settings Sidebar',
} as Meta;

const Template: Story = (args) => <NotificationsSideDrawer {...args} />;

export const Default = Template.bind({});
Default.args = {};
