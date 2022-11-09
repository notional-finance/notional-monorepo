import { Story, Meta } from '@storybook/react';
import NetworkSelector from './network-selector';

export default {
  component: NetworkSelector,
  title: 'Network Selector',
} as Meta;

const Template: Story = (args) => <NetworkSelector {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
