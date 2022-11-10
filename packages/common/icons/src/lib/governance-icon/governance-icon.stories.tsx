import { Story, Meta } from '@storybook/react';
import { GovernanceIcon, GovernanceIconProps } from './governance-icon';

export default {
  component: GovernanceIcon,
  title: 'GovernanceIcon',
} as Meta;

const Template: Story<GovernanceIconProps> = (args) => <GovernanceIcon {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
