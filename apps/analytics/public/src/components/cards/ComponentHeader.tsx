// material-ui
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';

// assets
import GlobalOutlined from '@ant-design/icons/GlobalOutlined';
import NodeExpandOutlined from '@ant-design/icons/NodeExpandOutlined';

// ==============================|| COMPONENTS - HEADER ||============================== //

interface Props {
  title: string;
  caption?: string;
  directory?: string;
  link?: string;
}

export default function ComponentHeader({ title, caption, directory, link }: Props) {
  return (
    <Box sx={{ pl: 3, pr: 1 }}>
      <Stack spacing={1.25}>
        <Typography variant="h2">{title}</Typography>
        {caption && (
          <Typography variant="h6" color="text.secondary">
            {caption}
          </Typography>
        )}
      </Stack>
      <Grid container spacing={0.75} sx={{ mt: 1.75 }}>
        {directory && (
          <Grid item xs={12}>
            <Typography variant="caption" color="text.secondary">
              <NodeExpandOutlined style={{ marginRight: 10 }} />
              {directory}
            </Typography>
          </Grid>
        )}
        {link && (
          <Grid item xs={12}>
            <Link variant="caption" color="primary" href={link} target="_blank">
              <GlobalOutlined style={{ marginRight: 10 }} />
              {link}
            </Link>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
