import { Story, Meta } from '@storybook/react';
import ViewAsAccount from './view-as-account';

export default {
  component: ViewAsAccount,
  title: 'Connect Wallet',
} as Meta;

const Template: Story = (args) => <ViewAsAccount {...args} />;

export const Default = Template.bind({});
Default.args = {};
