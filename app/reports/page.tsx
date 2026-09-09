import { db } from "@/db";
import {
  items,
  units,
  incomingTransactions,
  incomingItems,
  outgoingTransactions,
  outgoingItems,
  suppliers,
} from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { ReportView } from "@/components/reports/report-view";
import { FileText } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  // 1. Ambil data master seluruh item
  const allItems = await db
    .select({
      id: items.id,
      code: items.code,
      name: items.name,
      currentStock: items.currentStock,
      minimumStock: items.minimumStock,
      unitSymbol: units.symbol,
    })
    .from(items)
    .leftJoin(units, eq(items.unitId, units.id))
    .orderBy(items.name);

  // 2. Ambil seluruh pergerakan barang masuk
  const inMovements = await db
    .select({
      id: incomingItems.id,
      date: incomingTransactions.transactionDate,
      ref: incomingTransactions.invoiceNumber,
      supplier: suppliers.name,
      itemId: incomingItems.itemId,
      quantity: incomingItems.quantity,
      notes: incomingItems.notes,
    })
    .from(incomingItems)
    .innerJoin(
      incomingTransactions,
      eq(incomingItems.transactionId, incomingTransactions.id)
    )
    .leftJoin(suppliers, eq(incomingTransactions.supplierId, suppliers.id))
    .orderBy(desc(incomingTransactions.transactionDate));

  // 3. Ambil seluruh pergerakan barang keluar
  const outMovements = await db
    .select({
      id: outgoingItems.id,
      date: outgoingTransactions.transactionDate,
      ref: outgoingTransactions.referenceNumber,
      recipient: outgoingTransactions.recipientName,
      section: outgoingTransactions.projectSection,
      itemId: outgoingItems.itemId,
      quantity: outgoingItems.quantity,
      notes: outgoingItems.notes,
    })
    .from(outgoingItems)
    .innerJoin(
      outgoingTransactions,
      eq(outgoingItems.transactionId, outgoingTransactions.id)
    )
    .orderBy(desc(outgoingTransactions.transactionDate));

  return (
    <div className="space-y-6">
      {/* Header Halaman (Disembunyikan saat cetak) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Laporan Inventaris & Mutasi Logistik
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Rekapitulasi arus keluar-masuk material proyek berdasarkan rentang tanggal dan verifikasi saldo akhir fisik.
          </p>
        </div>
      </div>

      {/* Komponen Laporan dengan Fitur Cetak Resmi */}
      <ReportView
        items={allItems}
        incomingMovements={inMovements.map((m) => ({
          ...m,
          supplier: m.supplier || "Supplier",
        }))}
        outgoingMovements={outMovements}
      />
    </div>
  );
}

