import { Story, Meta } from '@storybook/react';
import { ToggleSwitch, ToggleSwitchProps } from './toggle-switch';

export default {
  component: ToggleSwitch,
  title: 'ToggleSwitch',
} as Meta;

const Template: Story<ToggleSwitchProps> = (args) => <ToggleSwitch {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  isChecked: true,
  onChecked: () => console.info('onChecked'),
  onUnchecked: () => console.info('onUnchecked'),
};
