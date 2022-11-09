import { Story, Meta } from '@storybook/react';
import { ButtonBar, ButtonBarPropType } from './button-bar';

export default {
  component: ButtonBar,
  title: 'ButtonBar',
} as Meta;

const Template: Story<ButtonBarPropType> = (args) => <ButtonBar {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
