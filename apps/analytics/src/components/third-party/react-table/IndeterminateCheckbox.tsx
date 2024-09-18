// material-ui
import Checkbox, { CheckboxProps } from '@mui/material/Checkbox';

// ==============================|| ROW SELECTION - CHECKBOX ||============================== //

export default function IndeterminateCheckbox({ indeterminate, ...rest }: { indeterminate?: boolean } & CheckboxProps) {
  return <Checkbox {...rest} indeterminate={typeof indeterminate === 'boolean' && !rest.checked && indeterminate} />;
}
