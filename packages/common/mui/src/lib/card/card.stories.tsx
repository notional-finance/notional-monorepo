import { CardContent } from '@mui/material';
import { Story, Meta } from '@storybook/react';
import { Card, CardProps } from './card';

export default {
  component: Card,
  title: 'Card',
} as Meta;

const Template: Story<CardProps> = (args) => <Card {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  children: (
    <CardContent>
      <span>Hello</span>
    </CardContent>
  ),
};
