import { TableCell, LargeTableCell } from '../../typography/typography';

export const BorderCell = ({ cell }): JSX.Element => {
  const { getValue, column } = cell;
  const value = getValue();
  const Cell = column?.columnDef.expandableTable ? LargeTableCell : TableCell;
  return (
    <Cell>
      <div className="border-cell">{value}</div>
    </Cell>
  );
};

export default BorderCell;
