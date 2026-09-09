import { db } from "@/db";
import {
  incomingTransactions,
  incomingItems,
  suppliers,
  items,
  units,
} from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { IncomingDialog } from "@/components/transactions/incoming-dialog";
import { TransactionDetailDialog } from "@/components/transactions/transaction-detail-dialog";
import { formatDate, formatNumber } from "@/lib/utils";
import { ArrowDownLeft, FileText } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function IncomingPage() {
  // 1. Ambil seluruh transaksi penerimaan barang masuk
  const transactionsData = await db
    .select({
      id: incomingTransactions.id,
      invoiceNumber: incomingTransactions.invoiceNumber,
      transactionDate: incomingTransactions.transactionDate,
      recipientName: incomingTransactions.recipientName,
      notes: incomingTransactions.notes,
      supplierName: suppliers.name,
    })
    .from(incomingTransactions)
    .leftJoin(suppliers, eq(incomingTransactions.supplierId, suppliers.id))
    .orderBy(desc(incomingTransactions.id));

  // 2. Ambil detail item untuk seluruh transaksi
  const allDetails = await db
    .select({
      id: incomingItems.id,
      transactionId: incomingItems.transactionId,
      quantity: incomingItems.quantity,
      notes: incomingItems.notes,
      itemName: items.name,
      itemCode: items.code,
      unitSymbol: units.symbol,
    })
    .from(incomingItems)
    .leftJoin(items, eq(incomingItems.itemId, items.id))
    .leftJoin(units, eq(items.unitId, units.id));

  // 3. Ambil data master untuk form input
  const allSuppliers = await db.select({ id: suppliers.id, name: suppliers.name }).from(suppliers);
  const allItems = await db
    .select({
      id: items.id,
      code: items.code,
      name: items.name,
      currentStock: items.currentStock,
      unitSymbol: units.symbol,
    })
    .from(items)
    .leftJoin(units, eq(items.unitId, units.id));

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Penerimaan Barang Masuk (Inflow)
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Pencatatan surat jalan material dari vendor/supplier dan otomatisasi penambahan stok gudang.
          </p>
        </div>

        {/* Tombol Form Catat Barang Masuk */}
        <IncomingDialog suppliers={allSuppliers} items={allItems} />
      </div>

      {/* Tabel Riwayat Barang Masuk */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">
            Riwayat Surat Jalan Masuk ({transactionsData.length} Transaksi)
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">No. Surat Jalan</th>
                <th className="px-5 py-3">Tanggal</th>
                <th className="px-5 py-3">Supplier Vendor</th>
                <th className="px-5 py-3">Penerima Lapangan</th>
                <th className="px-5 py-3 text-center">Macam Item</th>
                <th className="px-5 py-3">Catatan</th>
                <th className="px-5 py-3 text-center">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactionsData.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-slate-400 text-sm"
                  >
                    Belum ada transaksi barang masuk yang tercatat.
                  </td>
                </tr>
              ) : (
                transactionsData.map((tx) => {
                  const txItems = allDetails.filter(
                    (d) => d.transactionId === tx.id
                  );
                  const totalQty = txItems.reduce((acc, curr) => acc + curr.quantity, 0);

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="px-5 py-3.5 font-mono text-xs font-bold text-slate-800">
                        {tx.invoiceNumber}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-600">
                        {formatDate(tx.transactionDate)}
                      </td>
                      <td className="px-5 py-3.5 font-medium text-slate-900">
                        {tx.supplierName || "-"}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-600">
                        {tx.recipientName}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {txItems.length} Material ({formatNumber(totalQty)} total)
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-400 max-w-xs truncate">
                        {tx.notes || "-"}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <TransactionDetailDialog
                          title="Detail Surat Jalan Penerimaan"
                          referenceNumber={tx.invoiceNumber}
                          date={tx.transactionDate}
                          partyLabel="Supplier Pengirim"
                          partyName={tx.supplierName || "-"}
                          subInfoLabel="Petugas Penerima"
                          subInfoValue={tx.recipientName}
                          notes={tx.notes}
                          items={txItems.map((item) => ({
                            id: item.id,
                            itemName: item.itemName || "Material",
                            itemCode: item.itemCode || "-",
                            quantity: item.quantity,
                            unitSymbol: item.unitSymbol || "",
                            notes: item.notes,
                          }))}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

