import { TableCell, LargeTableCell } from '../../typography/typography';

export const BorderCell = ({ cell }): JSX.Element => {
  const { value, column } = cell;
  const Cell = column?.expandableTable ? LargeTableCell : TableCell;
  return (
    <Cell>
      <div className="border-cell">{value}</div>
    </Cell>
  );
};

export default BorderCell;
