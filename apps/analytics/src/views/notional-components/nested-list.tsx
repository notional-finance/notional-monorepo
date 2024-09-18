'use client';
import DownOutlined from '@ant-design/icons/DownOutlined';
import UpOutlined from '@ant-design/icons/UpOutlined';
import { Collapse, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import ListItemButton from '@mui/material/ListItemButton';

interface NestedListItem {
  id: string;
  icon: any;
  text: string;
  listItems?: NestedListItem[];
}

interface NestedListProps {
  data: NestedListItem[];
  open: string | null;
  setOpen: React.Dispatch<React.SetStateAction<string | null>>;
  childSelected: string | null;
  setChildSelected: React.Dispatch<React.SetStateAction<string | null>>;
}

export const NestedList = ({ data, open, setOpen, childSelected, setChildSelected }: NestedListProps) => {
  const handleClick = (item: string) => {
    setOpen((prevOpen) => (prevOpen === item ? null : item));
    const selectedListItem = data.find((listItem) => listItem.id === item);
    const selectedChildItem = selectedListItem?.listItems ? selectedListItem?.listItems[0] : null;
    if (selectedChildItem?.id) {
      setChildSelected(selectedChildItem?.id);
    }
  };

  const handleChildClick = (item: string) => {
    setChildSelected((prevOpen) => (prevOpen === item ? null : item));
  };

  return (
    <List sx={{ p: 0, minWidth: '266px', height: '447px', border: '1px solid #E7E8F2', borderRadius: '6px', overflow: 'auto' }}>
      {data.map((item) => (
        <div key={item.id}>
          <ListItem disablePadding divider>
            <ListItemButton onClick={() => handleClick(item.id)} selected={open === item.id}>
              <ListItemIcon>
                <item.icon />
              </ListItemIcon>
              <ListItemText primary={item.text} sx={{ span: { fontWeight: 500 } }} />
              {open === item.id ? <DownOutlined style={{ fontSize: '0.75rem' }} /> : <UpOutlined style={{ fontSize: '0.75rem' }} />}
            </ListItemButton>
          </ListItem>
          <Collapse in={open === item.id} timeout="auto" unmountOnExit>
            {item.listItems && (
              <List disablePadding sx={{ bgcolor: 'secondary.100' }}>
                {item.listItems.map((childItem) => (
                  <ListItemButton
                    key={childItem.id}
                    sx={{ pl: 7, '&.Mui-selected': { borderRight: '2px solid', borderColor: 'primary.main' } }}
                    onClick={() => handleChildClick(childItem.id)}
                    selected={childSelected === childItem.id}
                  >
                    <ListItemText primary={childItem.text} />
                  </ListItemButton>
                ))}
              </List>
            )}
          </Collapse>
        </div>
      ))}
    </List>
  );
};

export default NestedList;
