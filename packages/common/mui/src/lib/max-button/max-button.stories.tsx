import { Story, Meta } from '@storybook/react';
import { MaxButton, MaxButtonProps } from './max-button';

export default {
  component: MaxButton,
  title: 'MaxButton',
} as Meta;

const Template: Story<MaxButtonProps> = (args) => {
  return <MaxButton {...args} />;
};

export const Primary = Template.bind({});
Primary.args = {
  isVisible: true,
};
