import { Story, Meta } from '@storybook/react';
import { Switch, SwitchProps } from './switch';

export default {
  component: Switch,
  title: 'Switch',
} as Meta;

const Template: Story<SwitchProps> = (args) => <Switch {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
