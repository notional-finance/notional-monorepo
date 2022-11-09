import { Story, Meta } from '@storybook/react';
import { InsuranceIcon, InsuranceIconProps } from './insurance-icon';

export default {
  component: InsuranceIcon,
  title: 'InsuranceIcon',
} as Meta;

const Template: Story<InsuranceIconProps> = (args) => <InsuranceIcon {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
