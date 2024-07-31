'use client';

// material-ui
import { useTheme } from '@mui/material/styles';

// third-party
import { Text, View, StyleSheet } from '@react-pdf/renderer';

// types
import { InvoiceList } from 'types/invoice';

const textPrimary = '#262626';
const textSecondary = '#8c8c8c';
const border = '#f0f0f0';

// custom Style
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
    '@media max-width: 400': {
      paddingTop: 10,
      paddingLeft: 0
    }
  },
  card: {
    border: '1px solid',
    borderColor: border,
    borderRadius: '2px',
    padding: '20px',
    width: '48%'
  },
  title: {
    color: textPrimary,
    fontSize: '12px',
    fontWeight: 500
  },
  caption: {
    color: textSecondary,
    fontSize: '10px'
  },
  tableTitle: {
    color: textPrimary,
    fontSize: '10px',
    fontWeight: 500
  },
  tableCell: {
    color: textPrimary,
    fontSize: '10px'
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24
  },

  subRow: {
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    margin: 0,
    paddingBottom: 20
  },
  column: {
    flexDirection: 'column'
  },

  paragraph: {
    color: '#1F2937',
    fontSize: '12px'
  },

  tableHeader: {
    justifyContent: 'space-between',
    borderBottom: '1px solid #f0f0f0',
    borderTop: '1px solid #f0f0f0',
    paddingTop: '10px',
    paddingBottom: '10px',
    margin: 0,
    paddingLeft: 10
  },
  tableRow: {
    alignItems: 'center',
    justifyContent: 'center',
    borderBottom: '1px solid #f0f0f0',
    paddingBottom: 10,
    paddingTop: 10,
    margin: 0,
    paddingLeft: 10
  },
  amountSection: { margin: 0, paddingRight: 25, paddingTop: 16, justifyContent: 'flex-end' },
  amountRow: { margin: 0, width: '40%', justifyContent: 'space-between' },
  pb5: { paddingBottom: 5 },
  flex03: { flex: '0.3 1 0px' },
  flex07: { flex: '0.7 1 0px' },
  flex17: { flex: '1.7 1 0px' },
  flex20: { flex: '2 1 0px' }
});

interface Props {
  list: InvoiceList | null;
}

// ==============================|| INVOICE EXPORT - CONTENT ||============================== //

export default function Content({ list }: Props) {
  const theme = useTheme();
  const subtotal = list?.invoice_detail?.reduce((prev: any, curr: any) => {
    if (curr.name.trim().length > 0) return prev + Number(curr.price * Math.floor(curr.qty));
    else return prev;
  }, 0);

  const taxRate = (Number(list?.tax) * subtotal) / 100;
  const discountRate = (Number(list?.discount) * subtotal) / 100;
  const total = subtotal - discountRate + taxRate;

  return (
    <View style={styles.container}>
      <View style={[styles.row, styles.subRow]}>
        <View style={styles.card}>
          <Text style={[styles.title, { marginBottom: 8 }]}>From:</Text>
          <Text style={[styles.caption, styles.pb5]}>{list?.cashierInfo?.name}</Text>
          <Text style={[styles.caption, styles.pb5]}>{list?.cashierInfo?.address}</Text>
          <Text style={[styles.caption, styles.pb5]}>{list?.cashierInfo?.phone}</Text>
          <Text style={[styles.caption, styles.pb5]}>{list?.cashierInfo?.email}</Text>
        </View>
        <View style={styles.card}>
          <Text style={[styles.title, { marginBottom: 8 }]}>To:</Text>
          <Text style={[styles.caption, styles.pb5]}>{list?.customerInfo?.name}</Text>
          <Text style={[styles.caption, styles.pb5]}>{list?.customerInfo?.address}</Text>
          <Text style={[styles.caption, styles.pb5]}>{list?.customerInfo?.phone}</Text>
          <Text style={[styles.caption, styles.pb5]}>{list?.customerInfo?.email}</Text>
        </View>
      </View>
      <View>
        <View style={[styles.row, styles.tableHeader, { backgroundColor: theme.palette.grey[100] }]}>
          <Text style={[styles.tableTitle, styles.flex03]}>#</Text>
          <Text style={[styles.tableTitle, styles.flex17]}>NAME</Text>
          <Text style={[styles.tableTitle, styles.flex20]}>DESCRIPTION</Text>
          <Text style={[styles.tableTitle, styles.flex07]}>QTY</Text>
          <Text style={[styles.tableTitle, styles.flex07]}>PRICE</Text>
          <Text style={[styles.tableTitle, styles.flex07]}>AMOUNT</Text>
        </View>
        {list?.invoice_detail.map((row: any, index: number) => {
          return (
            <View style={[styles.row, styles.tableRow]} key={row.id}>
              <Text style={[styles.tableCell, styles.flex03]}>{index + 1}</Text>
              <Text style={[styles.tableCell, styles.flex17, { textOverflow: 'ellipsis' }]}>{row.name}</Text>
              <Text style={[styles.tableCell, styles.flex20]}>{row.description}</Text>
              <Text style={[styles.tableCell, styles.flex07]}>{row.qty}</Text>
              <Text style={[styles.tableCell, styles.flex07]}>{`$${Number(row.price).toFixed(2)}`}</Text>
              <Text style={[styles.tableCell, styles.flex07]}>{`$${Number(row.price * row.qty).toFixed(2)}`}</Text>
            </View>
          );
        })}
      </View>
      <View style={[styles.row, { paddingTop: 25, margin: 0, paddingRight: 25, justifyContent: 'flex-end' }]}>
        <View style={[styles.row, styles.amountRow]}>
          <Text style={styles.caption}>Sub Total:</Text>
          <Text style={styles.tableCell}>${subtotal?.toFixed(2)}</Text>
        </View>
      </View>
      <View style={[styles.row, styles.amountSection]}>
        <View style={[styles.row, styles.amountRow]}>
          <Text style={styles.caption}>Discount:</Text>
          <Text style={[styles.caption, { color: theme.palette.success.main }]}>${discountRate?.toFixed(2)}</Text>
        </View>
      </View>
      <View style={[styles.row, styles.amountSection]}>
        <View style={[styles.row, styles.amountRow]}>
          <Text style={styles.caption}>Tax:</Text>
          <Text style={[styles.caption]}>${taxRate?.toFixed(2)}</Text>
        </View>
      </View>
      <View style={[styles.row, styles.amountSection]}>
        <View style={[styles.row, styles.amountRow]}>
          <Text style={styles.tableCell}>Grand Total:</Text>
          <Text style={styles.tableCell}>${total % 1 === 0 ? total : total?.toFixed(2)}</Text>
        </View>
      </View>
      <View style={[styles.row, { alignItems: 'flex-start', marginTop: 20, width: '95%' }]}>
        <Text style={styles.caption}>Notes </Text>
        <Text style={styles.tableCell}>
          {' '}
          It was a pleasure working with you and your team. We hope you will keep us in mind for future freelance projects. Thank You!
        </Text>
      </View>
    </View>
  );
}
