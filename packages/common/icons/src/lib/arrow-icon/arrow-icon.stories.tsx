import { Story, Meta } from '@storybook/react';
import { ArrowIcon, ArrowIconProps } from './arrow-icon';

export default {
  component: ArrowIcon,
  title: 'ArrowIcon',
} as Meta;

const Template: Story<ArrowIconProps> = (args) => <ArrowIcon {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
