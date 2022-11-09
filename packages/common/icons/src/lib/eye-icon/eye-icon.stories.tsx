import { Story, Meta } from '@storybook/react';
import { EyeIcon, EyeIconProps } from './eye-icon';

export default {
  component: EyeIcon,
  title: 'EyeIcon',
} as Meta;

const Template: Story<EyeIconProps> = (args) => <EyeIcon {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
