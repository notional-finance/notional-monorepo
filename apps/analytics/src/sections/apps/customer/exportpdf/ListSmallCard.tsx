//material-ui
import { useTheme } from '@mui/material/styles';

// third-party
import { Page, View, Document, StyleSheet, Image, Text, Link } from '@react-pdf/renderer';

// types
import { CustomerList } from 'types/customer';

//asset
const LinkIcon = '/assets/images/icons/link.png';
const Mail = '/assets/images/icons/mail.png';
const Maps = '/assets/images/icons/map.png';
const Phone = '/assets/images/icons/phone.png';

const textPrimary = '#262626';
const textSecondary = '#8c8c8c';
const border = '#f0f0f0';

const styles = StyleSheet.create({
  page: {
    padding: 30
  },
  container: {
    border: '1px solid',
    borderColor: border,
    padding: 18,
    flexDirection: 'column',
    '@media max-width: 400': {
      flexDirection: 'column'
    }
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    objectFit: 'cover'
  },
  CardInfo: {
    display: 'flex',
    flexDirection: 'column'
  },
  title: {
    fontSize: 14,
    lineHeight: 1.57,
    color: textPrimary
  },
  role: {
    fontSize: 10,
    lineHeight: 1.66,
    color: textSecondary
  },
  hr: {
    borderBottom: '1px solid',
    borderBottomColor: border,
    paddingTop: 18
    // paddingBottom: 18
  },
  about: {
    paddingTop: 18,
    fontSize: 14,
    lineHeight: 1.57,
    fontWeight: 'demibold',
    color: textPrimary,
    paddingBottom: 18
  },
  IconContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  IconRow: {
    width: '48%',
    gap: 10,
    paddingBottom: 10
  },
  icon: {
    width: 12,
    height: 10
  },
  iconTitle: {
    fontSize: 10,
    lineHeight: 1.57,
    color: textSecondary
  },
  chip: {
    border: '1px solid',
    borderColor: textSecondary,
    alignItems: 'center',
    borderRadius: '4px',
    marginLeft: 4,
    marginRight: 4,
    marginBottom: 8
  },
  chipTitle: {
    color: textSecondary,
    fontSize: '10px',
    paddingLeft: 8,
    paddingRight: 8,
    paddingBottom: 4,
    paddingTop: 4
  },
  timer: {
    marginTop: 25
  }
});

interface Props {
  customer: CustomerList;
}

export default function ListSmallCard({ customer }: Props) {
  const theme = useTheme();
  return (
    <Document title={`${customer?.name}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.container}>
          <View style={styles.row}>
            {/* eslint-disable-next-line */}
            <Image style={styles.image} src={`/assets/images/users/avatar-${!customer.avatar ? 1 : customer.avatar}.png`} />
            <View style={styles.CardInfo}>
              <Text style={styles.title}>{customer.name}</Text>
              <Text style={styles.role}>{customer.role}</Text>
            </View>
          </View>
          <View style={styles.hr} />
          <View>
            <Text style={styles.about}>Hello, {customer.about}</Text>
          </View>
          <View style={styles.IconContainer}>
            <View style={[styles.row, styles.IconRow]}>
              {/* eslint-disable-next-line */}
              <Image src={Mail} style={styles.icon} />
              <Text style={styles.iconTitle}>{customer.email}</Text>
            </View>
            <View style={[styles.row, styles.IconRow]}>
              {/* eslint-disable-next-line */}
              <Image src={Maps} style={styles.icon} />
              <Text style={styles.iconTitle}>{customer.country}</Text>
            </View>
          </View>
          <View style={styles.IconContainer}>
            <View style={[styles.row, styles.IconRow]}>
              {/* eslint-disable-next-line */}
              <Image src={Phone} style={styles.icon} />
              <Text style={styles.iconTitle}>{customer.contact}</Text>
            </View>
            <View style={[styles.row, styles.IconRow]}>
              {/* eslint-disable-next-line */}
              <Image src={LinkIcon} style={styles.icon} />
              <Link
                style={[styles.iconTitle, { color: theme.palette.primary.main }]}
                src={`https://${customer.firstName}.en`}
              >{`https://${customer.firstName}.en`}</Link>
            </View>
          </View>
          <View style={[styles.row, { gap: 1, paddingTop: 18 }]}>
            {customer.skills.map((skill: string, index: number) => (
              <View style={styles.chip} key={index}>
                <Text style={styles.chipTitle}>{skill}</Text>
              </View>
            ))}
          </View>
          <View style={styles.timer}>
            <Text style={styles.iconTitle}> Updated in {customer.time}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
