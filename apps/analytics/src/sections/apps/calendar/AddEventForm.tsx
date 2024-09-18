// material-ui
import { useTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { LocalizationProvider, MobileDateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// third-party
import _ from 'lodash';
import * as Yup from 'yup';
import { useFormik, Form, FormikProvider, FormikValues } from 'formik';

// project imports
import ColorPalette from './ColorPalette';
import IconButton from 'components/@extended/IconButton';

import { openSnackbar } from 'api/snackbar';
import { createEvent, updateEvent, deleteEvent } from 'api/calender';

// assets
import CalendarOutlined from '@ant-design/icons/CalendarOutlined';
import DeleteFilled from '@ant-design/icons/DeleteFilled';

// types
import { SnackbarProps } from 'types/snackbar';
import { DateRange } from 'types/calendar';

// constant
const getInitialValues = (event: FormikValues | null, range: DateRange | null) => {
  const newEvent = {
    title: '',
    description: '',
    color: '#1890ff',
    textColor: '#fff',
    allDay: false,
    start: range ? new Date(range.start) : new Date(),
    end: range ? new Date(range.end) : new Date()
  };

  if (event || range) {
    return _.merge({}, newEvent, event);
  }

  return newEvent;
};

// ==============================|| CALENDAR EVENT ADD / EDIT / DELETE ||============================== //

export interface AddEventFormProps {
  event?: FormikValues | null;
  range: DateRange | null;
  onCancel: () => void;
  modalCallback: (openModal: boolean) => void;
}

export default function AddEventFrom({ event, range, onCancel, modalCallback }: AddEventFormProps) {
  const theme = useTheme();
  const isCreating = !event;

  const backgroundColor = [
    {
      value: theme.palette.primary.main,
      color: 'primary.main'
    },
    {
      value: theme.palette.error.main,
      color: 'error.main'
    },
    {
      value: theme.palette.success.main,
      color: 'success.main'
    },
    {
      value: theme.palette.secondary.main,
      color: 'secondary.main'
    },
    {
      value: theme.palette.warning.main,
      color: 'warning.main'
    },
    {
      value: theme.palette.primary.lighter,
      color: 'primary.lighter'
    },
    {
      value: theme.palette.error.lighter,
      color: 'error.lighter'
    },
    {
      value: theme.palette.success.lighter,
      color: 'success.lighter'
    },
    {
      value: theme.palette.secondary.lighter,
      color: 'secondary.lighter'
    },
    {
      value: theme.palette.warning.lighter,
      color: 'warning.lighter'
    }
  ];

  const textColor = [
    {
      value: '#fff',
      color: 'white'
    },
    {
      value: theme.palette.error.lighter,
      color: 'error.lighter'
    },
    {
      value: theme.palette.success.lighter,
      color: 'success.lighter'
    },
    {
      value: theme.palette.secondary.lighter,
      color: 'secondary.lighter'
    },
    {
      value: theme.palette.warning.lighter,
      color: 'warning.lighter'
    },
    {
      value: theme.palette.primary.lighter,
      color: 'primary.lighter'
    },
    {
      value: theme.palette.primary.main,
      color: 'primary.main'
    },
    {
      value: theme.palette.error.main,
      color: 'error.main'
    },
    {
      value: theme.palette.success.main,
      color: 'success.main'
    },
    {
      value: theme.palette.secondary.main,
      color: 'secondary.main'
    },
    {
      value: theme.palette.warning.main,
      color: 'warning.main'
    }
  ];

  const EventSchema = Yup.object().shape({
    title: Yup.string().max(255).required('Title is required'),
    description: Yup.string().max(5000),
    end: Yup.date().when('start', (start, schema) => start && schema.min(start, 'End date must be later than start date')),
    start: Yup.date(),
    color: Yup.string().max(255),
    textColor: Yup.string().max(255)
  });

  const deleteHandler = async () => {
    await deleteEvent(event?.id);
    openSnackbar({
      open: true,
      message: 'Event deleted successfully.',
      variant: 'alert',
      alert: {
        color: 'success'
      }
    } as SnackbarProps);
    modalCallback(false);
  };

  const formik = useFormik({
    initialValues: getInitialValues(event!, range),
    validationSchema: EventSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const newEvent = {
          title: values.title,
          description: values.description,
          color: values.color,
          textColor: values.textColor,
          allDay: values.allDay,
          start: values.start,
          end: values.end
        };

        if (event) {
          await updateEvent(event.id, newEvent);
          openSnackbar({
            open: true,
            message: 'Event update successfully.',
            variant: 'alert',
            alert: {
              color: 'success'
            }
          } as SnackbarProps);
          modalCallback(false);
        } else {
          await createEvent(newEvent);
          openSnackbar({
            open: true,
            message: 'Event added successfully.',
            variant: 'alert',
            alert: {
              color: 'success'
            }
          } as SnackbarProps);
          modalCallback(false);
        }

        setSubmitting(false);
      } catch (error) {
        console.error(error);
      }
    }
  });

  const { values, errors, touched, handleSubmit, isSubmitting, getFieldProps, setFieldValue } = formik;

  return (
    <FormikProvider value={formik}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
          <DialogTitle>{event ? 'Edit Event' : 'Add Event'}</DialogTitle>
          <Divider />
          <DialogContent sx={{ p: 2.5 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="cal-title">Title</InputLabel>
                  <TextField
                    fullWidth
                    id="cal-title"
                    placeholder="Title"
                    {...getFieldProps('title')}
                    error={Boolean(touched.title && errors.title)}
                    helperText={touched.title && errors.title}
                  />
                </Stack>
              </Grid>
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="cal-description">Description</InputLabel>
                  <TextField
                    fullWidth
                    id="cal-description"
                    multiline
                    rows={3}
                    placeholder="Description"
                    {...getFieldProps('description')}
                    error={Boolean(touched.description && errors.description)}
                    helperText={touched.description && errors.description}
                  />
                </Stack>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel control={<Switch checked={values.allDay} {...getFieldProps('allDay')} />} label="All day" />
              </Grid>
              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="cal-start-date">Start Date</InputLabel>
                  <MobileDateTimePicker
                    value={new Date(values.start)}
                    format="dd/MM/yyyy hh:mm a"
                    onChange={(date) => setFieldValue('start', date)}
                    slotProps={{
                      textField: {
                        InputProps: {
                          endAdornment: (
                            <InputAdornment position="end" sx={{ cursor: 'pointer' }}>
                              <CalendarOutlined />
                            </InputAdornment>
                          )
                        }
                      }
                    }}
                  />
                </Stack>
                {touched.start && errors.start && <FormHelperText error={true}>{errors.start as string}</FormHelperText>}
              </Grid>
              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="cal-end-date">End Date</InputLabel>
                  <MobileDateTimePicker
                    value={new Date(values.end)}
                    format="dd/MM/yyyy hh:mm a"
                    onChange={(date) => setFieldValue('end', date)}
                    slotProps={{
                      textField: {
                        InputProps: {
                          endAdornment: (
                            <InputAdornment position="end" sx={{ cursor: 'pointer' }}>
                              <CalendarOutlined />
                            </InputAdornment>
                          )
                        }
                      }
                    }}
                  />
                </Stack>
                {touched.end && errors.end && <FormHelperText error={true}>{errors.end as string}</FormHelperText>}
              </Grid>
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1">Background Color</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl>
                      <RadioGroup
                        row
                        aria-label="color"
                        {...getFieldProps('color')}
                        onChange={(e) => setFieldValue('color', e.target.value)}
                        name="color-radio-buttons-group"
                        sx={{ '& .MuiFormControlLabel-root': { mr: 2 } }}
                      >
                        {backgroundColor.map((item, index) => (
                          <ColorPalette key={index} value={item.value} color={item.color} />
                        ))}
                      </RadioGroup>
                    </FormControl>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1">Text Color</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl component="fieldset">
                      <RadioGroup
                        row
                        aria-label="textColor"
                        {...getFieldProps('textColor')}
                        onChange={(e) => setFieldValue('textColor', e.target.value)}
                        name="text-color-radio-buttons-group"
                        sx={{ '& .MuiFormControlLabel-root': { mr: 2 } }}
                      >
                        {textColor.map((item, index) => (
                          <ColorPalette key={index} value={item.value} color={item.color} />
                        ))}
                      </RadioGroup>
                    </FormControl>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </DialogContent>
          <Divider />
          <DialogActions sx={{ p: 2.5 }}>
            <Grid container justifyContent="space-between" alignItems="center">
              <Grid item>
                {!isCreating && (
                  <Tooltip title="Delete Event" placement="top">
                    <IconButton onClick={deleteHandler} size="large" color="error">
                      <DeleteFilled />
                    </IconButton>
                  </Tooltip>
                )}
              </Grid>
              <Grid item>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Button color="error" onClick={onCancel}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="contained" disabled={isSubmitting}>
                    {event ? 'Edit' : 'Add'}
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </DialogActions>
        </Form>
      </LocalizationProvider>
    </FormikProvider>
  );
}
