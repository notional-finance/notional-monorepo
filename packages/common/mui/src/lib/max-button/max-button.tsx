import MiniButton, { MiniButtonProps } from '../mini-button/mini-button';

/* eslint-disable-next-line */
export interface MaxButtonProps extends MiniButtonProps {}

export function MaxButton({ isVisible, ...rest }: MaxButtonProps) {
  return <MiniButton label="MAX" isVisible={isVisible} {...rest} />;
}

export default MaxButton;
