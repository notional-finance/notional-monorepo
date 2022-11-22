import { Story, Meta } from '@storybook/react';
import Language from './language';

export default {
  component: Language,
  title: 'Wallet Switcher',
} as Meta;

const Template: Story = (args) => <Language {...args} />;

export const Default = Template.bind({});
Default.args = {};
