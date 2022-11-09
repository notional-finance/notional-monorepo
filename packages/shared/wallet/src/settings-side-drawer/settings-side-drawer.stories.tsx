import { Story, Meta } from '@storybook/react';
import SettingsSideDrawer from './settings-side-drawer';

export default {
  component: SettingsSideDrawer,
  title: 'Settings Sidebar',
} as Meta;

const Template: Story = (args) => <SettingsSideDrawer {...args} />;

export const Default = Template.bind({});
Default.args = {};
