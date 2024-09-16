// material-ui
import List from '@mui/material/List';
import ListItemText from '@mui/material/ListItemText';
import ListItem from '@mui/material/ListItem';
import CardMedia from '@mui/material/CardMedia';

// project import
import IconButton from 'components/@extended/IconButton';
import { DropzoneType } from 'config';

// utils
import getDropzoneData from 'utils/getDropzoneData';

// type
import { FilePreviewProps } from 'types/dropzone';

// assets
import CloseCircleFilled from '@ant-design/icons/CloseCircleFilled';
import FileFilled from '@ant-design/icons/FileFilled';

// ==============================|| MULTI UPLOAD - PREVIEW ||============================== //

export default function FilesPreview({ showList = false, files, onRemove, type }: FilePreviewProps) {
  const hasFile = files.length > 0;
  const layoutType = type;

  return (
    <List
      disablePadding
      sx={{
        ...(hasFile && type !== DropzoneType.STANDARD && { my: 3 }),
        ...(type === DropzoneType.STANDARD && { width: 'calc(100% - 84px)' })
      }}
    >
      {files.map((file, index) => {
        const { key, name, size, preview, type } = getDropzoneData(file, index);

        if (showList) {
          return (
            <ListItem
              key={key}
              sx={{
                p: 0,
                m: 0.5,
                width: layoutType === DropzoneType.STANDARD ? 64 : 80,
                height: layoutType === DropzoneType.STANDARD ? 64 : 80,
                borderRadius: 1.25,
                position: 'relative',
                display: 'inline-flex',
                verticalAlign: 'text-top',
                border: '1px solid',
                borderColor: 'divider',
                overflow: 'hidden'
              }}
            >
              {type?.includes('image') && <CardMedia component="img" alt="preview" src={preview} style={{ width: '100%' }} />}
              {!type?.includes('image') && <FileFilled style={{ width: '100%', fontSize: '1.5rem' }} />}

              {onRemove && (
                <IconButton
                  size="small"
                  color="error"
                  shape="rounded"
                  onClick={() => onRemove(file)}
                  sx={{
                    fontSize: '0.875rem',
                    bgcolor: 'background.paper',
                    p: 0,
                    width: 'auto',
                    height: 'auto',
                    top: 2,
                    right: 2,
                    position: 'absolute'
                  }}
                >
                  <CloseCircleFilled />
                </IconButton>
              )}
            </ListItem>
          );
        }

        return (
          <ListItem key={key} sx={{ my: 1, px: 2, py: 0.75, borderRadius: 0.75, border: 'solid 1px', borderColor: 'divider' }}>
            <FileFilled style={{ width: '30px', height: '30px', fontSize: '1.15rem', marginRight: 4 }} />
            <ListItemText
              primary={typeof file === 'string' ? file : name}
              secondary={typeof file === 'string' ? '' : size}
              primaryTypographyProps={{ variant: 'subtitle2' }}
              secondaryTypographyProps={{ variant: 'caption' }}
            />

            {onRemove && (
              <IconButton edge="end" size="small" onClick={() => onRemove(file)}>
                <CloseCircleFilled style={{ fontSize: '1.15rem' }} />
              </IconButton>
            )}
          </ListItem>
        );
      })}
    </List>
  );
}
