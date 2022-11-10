import { Story, Meta } from '@storybook/react';
import DarkModeToggle from './dark-mode-toggle';

export default {
  component: DarkModeToggle,
  title: 'Dark Mode Toggle',
} as Meta;

const Template: Story = (args) => <DarkModeToggle {...args} />;

export const Default = Template.bind({});
Default.args = {};
