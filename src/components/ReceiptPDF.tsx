'use client';
import React from 'react';
import { Document, Page, Text, View, StyleSheet,  } from '@react-pdf/renderer';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ReceiptItem {
  description: string;
  qty: string;
  unitPrice: number;
  total: number;
}

export interface ReceiptOrderData {
  orderNo: string;
  orderDate: string;
  paymentMethod: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  items: ReceiptItem[];
  subtotal: number;
  cgst: number;
  sgst: number;
  grandTotal: number;
}

// ─── Brand Colors ─────────────────────────────────────────────────────────────

const NAVY = '#0f172a';   // slate-900
const YELLOW = '#facc15'; // yellow-400
const LIGHT_GRAY = '#f8fafc';
const MID_GRAY = '#e2e8f0';
const TEXT_MUTED = '#64748b';
const WHITE = '#ffffff';

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    backgroundColor: WHITE,
    paddingTop: 40,
    paddingBottom: 50,
    paddingHorizontal: 40,
    fontSize: 10,
    color: NAVY,
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 28,
    paddingBottom: 20,
    borderBottomWidth: 3,
    borderBottomColor: YELLOW,
  },
  logoBlock: {
    flexDirection: 'column',
    gap: 4,
  },
  brandName: {
    fontSize: 26,
    fontFamily: 'Helvetica-Bold',
    color: NAVY,
    letterSpacing: 1,
  },
  brandTagline: {
    fontSize: 8,
    color: TEXT_MUTED,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  businessDetails: {
    marginTop: 8,
    gap: 2,
  },
  businessText: {
    fontSize: 8,
    color: TEXT_MUTED,
    lineHeight: 1.5,
  },
  invoiceLabel: {
    fontSize: 36,
    fontFamily: 'Helvetica-Bold',
    color: NAVY,
    letterSpacing: 3,
    textAlign: 'right',
  },
  invoiceAccent: {
    width: 60,
    height: 4,
    backgroundColor: YELLOW,
    marginTop: 6,
    alignSelf: 'flex-end',
  },

  // ── Info Grid ──
  infoGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  infoCard: {
    flex: 1,
    backgroundColor: LIGHT_GRAY,
    borderRadius: 6,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: YELLOW,
  },
  infoCardTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: TEXT_MUTED,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 4,
    gap: 4,
  },
  infoLabel: {
    fontSize: 8,
    color: TEXT_MUTED,
    width: 80,
  },
  infoValue: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: NAVY,
    flex: 1,
  },

  // ── Table ──
  tableWrapper: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: NAVY,
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 4,
    marginBottom: 2,
  },
  tableHeaderCell: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: WHITE,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: MID_GRAY,
  },
  tableRowAlt: {
    backgroundColor: LIGHT_GRAY,
  },
  tableCell: {
    fontSize: 9,
    color: NAVY,
  },
  colDesc: { flex: 3 },
  colQty: { flex: 1.2, textAlign: 'center' },
  colUnit: { flex: 1.5, textAlign: 'right' },
  colTotal: { flex: 1.5, textAlign: 'right' },

  // ── Summary ──
  summaryWrapper: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 28,
  },
  summaryBox: {
    width: 220,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: MID_GRAY,
  },
  summaryLabel: {
    fontSize: 9,
    color: TEXT_MUTED,
  },
  summaryValue: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: NAVY,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: NAVY,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 4,
    marginTop: 6,
  },
  totalLabel: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: YELLOW,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  totalValue: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: YELLOW,
  },

  // ── Footer ──
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: MID_GRAY,
    paddingTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  footerThankYou: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: NAVY,
    marginBottom: 3,
  },
  footerSub: {
    fontSize: 8,
    color: TEXT_MUTED,
  },
  footerContact: {
    textAlign: 'right',
  },
  footerContactText: {
    fontSize: 8,
    color: TEXT_MUTED,
    lineHeight: 1.6,
  },
  yellowDot: {
    width: 8,
    height: 8,
    backgroundColor: YELLOW,
    borderRadius: 4,
    marginRight: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  statusText: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#16a34a',
  },
});

// ─── Component ────────────────────────────────────────────────────────────────

export default function ReceiptPDF({ order }: { order: ReceiptOrderData }) {
  return (
    <Document
      title={`Linedry Receipt - ${order.orderNo}`}
      author="Linedry"
      subject="Laundry Service Receipt"
    >
      <Page size="A4" style={styles.page}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.logoBlock}>
            <Text style={styles.brandName}>Linedry</Text>
            <Text style={styles.brandTagline}>Clean clothes, zero hassle.</Text>
            <View style={styles.businessDetails}>
              <Text style={styles.businessText}>Linedry Central Hub, Block A, Sector V</Text>
              <Text style={styles.businessText}>Salt Lake, Kolkata – 700091, West Bengal</Text>
              <Text style={styles.businessText}>GSTIN: 19AAAAA1234A1Z5</Text>
              <Text style={styles.businessText}>support@linedry.in  |  +91 98300 00000</Text>
            </View>
          </View>
          <View>
            <Text style={styles.invoiceLabel}>INVOICE</Text>
            <View style={styles.invoiceAccent} />
            <View style={[styles.statusBadge, { marginTop: 10, alignSelf: 'flex-end' }]}>
              <View style={styles.yellowDot} />
              <Text style={styles.statusText}>PAID</Text>
            </View>
          </View>
        </View>

        {/* ── Info Grid ── */}
        <View style={styles.infoGrid}>
          {/* Billed To */}
          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>Billed To</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name</Text>
              <Text style={styles.infoValue}>{order.customerName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{order.customerPhone}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Address</Text>
              <Text style={styles.infoValue}>{order.deliveryAddress}</Text>
            </View>
          </View>

          {/* Order Details */}
          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>Order Details</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Order ID</Text>
              <Text style={styles.infoValue}>{order.orderNo}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Order Date</Text>
              <Text style={styles.infoValue}>{order.orderDate}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Payment</Text>
              <Text style={styles.infoValue}>{order.paymentMethod}</Text>
            </View>
          </View>
        </View>

        {/* ── Itemized Table ── */}
        <View style={styles.tableWrapper}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colDesc]}>Item / Service Description</Text>
            <Text style={[styles.tableHeaderCell, styles.colQty, { textAlign: 'center' }]}>Qty / Kg</Text>
            <Text style={[styles.tableHeaderCell, styles.colUnit, { textAlign: 'right' }]}>Unit Price (Rs.)</Text>
            <Text style={[styles.tableHeaderCell, styles.colTotal, { textAlign: 'right' }]}>Total (Rs.)</Text>
          </View>

          {/* Table Rows */}
          {order.items.map((item, idx) => (
            <View
              key={`item-${idx}`}
              style={[styles.tableRow, idx % 2 !== 0 ? styles.tableRowAlt : {}]}
            >
              <Text style={[styles.tableCell, styles.colDesc]}>{item.description}</Text>
              <Text style={[styles.tableCell, styles.colQty, { textAlign: 'center' }]}>{item.qty}</Text>
              <Text style={[styles.tableCell, styles.colUnit, { textAlign: 'right' }]}>
                {item.unitPrice.toFixed(2)}
              </Text>
              <Text style={[styles.tableCell, styles.colTotal, { textAlign: 'right' }]}>
                {item.total.toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        {/* ── Financial Summary ── */}
        <View style={styles.summaryWrapper}>
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>Rs. {order.subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>CGST (9%)</Text>
              <Text style={styles.summaryValue}>Rs. {order.cgst.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>SGST (9%)</Text>
              <Text style={styles.summaryValue}>Rs. {order.sgst.toFixed(2)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Grand Total</Text>
              <Text style={styles.totalValue}>Rs. {order.grandTotal.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* ── Footer ── */}
        <View style={styles.footer} fixed>
          <View>
            <Text style={styles.footerThankYou}>
              Thank you for trusting Linedry!
            </Text>
            <Text style={styles.footerSub}>
              Clean clothes, zero hassle. We look forward to serving you again.
            </Text>
          </View>
          <View style={styles.footerContact}>
            <Text style={styles.footerContactText}>support@linedry.in</Text>
            <Text style={styles.footerContactText}>+91 98300 00000</Text>
            <Text style={styles.footerContactText}>www.linedry.in</Text>
          </View>
        </View>

      </Page>
    </Document>
  );
}
