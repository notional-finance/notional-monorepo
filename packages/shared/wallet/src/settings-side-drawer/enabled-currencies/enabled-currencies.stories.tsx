import { Story, Meta } from '@storybook/react';
import EnabledCurrencies from './enabled-currencies';

export default {
  component: EnabledCurrencies,
  title: 'Wallet Switcher',
} as Meta;

const Template: Story = (args) => <EnabledCurrencies {...args} />;

export const Default = Template.bind({});
Default.args = {};
