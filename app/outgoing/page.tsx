import { db } from "@/db";
import {
  outgoingTransactions,
  outgoingItems,
  items,
  units,
} from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { OutgoingDialog } from "@/components/transactions/outgoing-dialog";
import { TransactionDetailDialog } from "@/components/transactions/transaction-detail-dialog";
import { formatDate, formatNumber } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function OutgoingPage() {
  // 1. Ambil seluruh transaksi pengeluaran barang
  const transactionsData = await db
    .select({
      id: outgoingTransactions.id,
      referenceNumber: outgoingTransactions.referenceNumber,
      transactionDate: outgoingTransactions.transactionDate,
      recipientName: outgoingTransactions.recipientName,
      projectSection: outgoingTransactions.projectSection,
      notes: outgoingTransactions.notes,
    })
    .from(outgoingTransactions)
    .orderBy(desc(outgoingTransactions.id));

  // 2. Ambil detail item untuk seluruh transaksi keluar
  const allDetails = await db
    .select({
      id: outgoingItems.id,
      transactionId: outgoingItems.transactionId,
      quantity: outgoingItems.quantity,
      notes: outgoingItems.notes,
      itemName: items.name,
      itemCode: items.code,
      unitSymbol: units.symbol,
    })
    .from(outgoingItems)
    .leftJoin(items, eq(outgoingItems.itemId, items.id))
    .leftJoin(units, eq(items.unitId, units.id));

  // 3. Ambil data master barang terkini untuk form input
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
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Pengeluaran Barang Keluar (Outflow)
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Pencatatan Surat Pengeluaran Barang (SPB) untuk mandor dan verifikasi alokasi pekerjaan di lapangan.
          </p>
        </div>

        {/* Tombol Form Catat Barang Keluar */}
        <OutgoingDialog items={allItems} />
      </div>

      {/* Tabel Riwayat Barang Keluar */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">
            Riwayat Surat Pengeluaran Barang ({transactionsData.length} Transaksi)
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">No. SPB</th>
                <th className="px-5 py-3">Tanggal</th>
                <th className="px-5 py-3">Mandor / Pengambil</th>
                <th className="px-5 py-3">Alokasi Pekerjaan Proyek</th>
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
                    Belum ada pengeluaran material yang tercatat.
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
                        {tx.referenceNumber}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-600">
                        {formatDate(tx.transactionDate)}
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-slate-900">
                        {tx.recipientName}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-amber-800 font-medium">
                        <span className="inline-block bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                          {tx.projectSection}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                          {txItems.length} Material ({formatNumber(totalQty)} total)
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-400 max-w-xs truncate">
                        {tx.notes || "-"}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <TransactionDetailDialog
                          title="Detail Pengeluaran Material (SPB)"
                          referenceNumber={tx.referenceNumber}
                          date={tx.transactionDate}
                          partyLabel="Mandor / Pengambil"
                          partyName={tx.recipientName}
                          subInfoLabel="Alokasi Bagian Proyek"
                          subInfoValue={tx.projectSection}
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

