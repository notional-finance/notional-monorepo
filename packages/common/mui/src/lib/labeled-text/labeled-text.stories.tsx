import { Story, Meta } from '@storybook/react';
import { LabeledText, LabeledTextProps } from './labeled-text';

export default {
  component: LabeledText,
  title: 'LabeledText',
} as Meta;

const Template: Story<LabeledTextProps> = (args) => <LabeledText {...args} />;

export const LabelAbove = Template.bind({});
LabelAbove.args = {
  label: 'label',
  value: '1234.587',
  labelAbove: true,
};

export const LabelBelow = Template.bind({});
LabelBelow.args = {
  label: 'label',
  value: '1234.587',
};
