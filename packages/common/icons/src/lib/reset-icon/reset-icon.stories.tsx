import { Story, Meta } from '@storybook/react';
import { ResetIcon, ResetIconProps } from './reset-icon';

export default {
  component: ResetIcon,
  title: 'ResetIcon',
} as Meta;

const Template: Story<ResetIconProps> = (args) => <ResetIcon {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
