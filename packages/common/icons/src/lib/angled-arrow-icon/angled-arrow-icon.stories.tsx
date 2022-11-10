import { Story, Meta } from '@storybook/react';
import { AngledArrowIcon, AngledArrowIconProps } from './angled-arrow-icon';

export default {
  component: AngledArrowIcon,
  title: 'AngledArrowIcon',
} as Meta;

const Template: Story<AngledArrowIconProps> = (args) => <AngledArrowIcon {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
