import Link from "next/link";
import { db } from "@/db";
import {
  items,
  categories,
  units,
  suppliers,
  incomingTransactions,
  incomingItems,
  outgoingTransactions,
  outgoingItems,
} from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatNumber, formatDate } from "@/lib/utils";
import {
  Package,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Truck,
  CheckCircle2,
  FileText,
  Activity,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // Ambil data dengan perlindungan try-catch agar halaman tidak crash jika env Vercel belum lengkap
  let allItems: any[] = [];
  let supplierCount = 0;
  let totalInQty = 0;
  let totalOutQty = 0;
  let recentActivities: any[] = [];
  let dbError: string | null = null;

  try {
    // Pastikan seluruh tabel dan data seed sudah siap di database Turso
    const { ensureDatabaseInitialized } = await import("@/db/init");
    await ensureDatabaseInitialized();

    // 1. Ambil data master material & relasinya dari Turso DB
    allItems = await db
      .select({
        id: items.id,
        code: items.code,
        name: items.name,
        currentStock: items.currentStock,
        minimumStock: items.minimumStock,
        categoryName: categories.name,
        unitSymbol: units.symbol,
      })
      .from(items)
      .leftJoin(categories, eq(items.categoryId, categories.id))
      .leftJoin(units, eq(items.unitId, units.id));

    // 2. Ambil total jumlah vendor
    supplierCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(suppliers)
      .then((res) => res[0]?.count || 0);

    // 3. Ambil agregasi pergerakan barang masuk & keluar
    totalInQty = await db
      .select({ sum: sql<number>`coalesce(sum(${incomingItems.quantity}), 0)` })
      .from(incomingItems)
      .then((res) => res[0]?.sum || 0);

    totalOutQty = await db
      .select({ sum: sql<number>`coalesce(sum(${outgoingItems.quantity}), 0)` })
      .from(outgoingItems)
      .then((res) => res[0]?.sum || 0);

    // 4. Ambil 4 transaksi masuk terbaru
    const recentIn = await db
      .select({
        id: incomingTransactions.id,
        ref: incomingTransactions.invoiceNumber,
        date: incomingTransactions.transactionDate,
        party: suppliers.name,
      })
      .from(incomingTransactions)
      .leftJoin(suppliers, eq(incomingTransactions.supplierId, suppliers.id))
      .orderBy(desc(incomingTransactions.id))
      .limit(4);

    // 5. Ambil 4 transaksi keluar terbaru
    const recentOut = await db
      .select({
        id: outgoingTransactions.id,
        ref: outgoingTransactions.referenceNumber,
        date: outgoingTransactions.transactionDate,
        party: outgoingTransactions.recipientName,
        section: outgoingTransactions.projectSection,
      })
      .from(outgoingTransactions)
      .orderBy(desc(outgoingTransactions.id))
      .limit(4);

    // Gabungkan dan urutkan aktivitas transaksi terbaru
    recentActivities = [
      ...recentIn.map((t) => ({
        id: `in-${t.id}`,
        type: "IN" as const,
        ref: t.ref,
        date: t.date,
        party: `Dari: ${t.party || "Supplier"}`,
        sub: "Surat Jalan Penerimaan",
      })),
      ...recentOut.map((t) => ({
        id: `out-${t.id}`,
        type: "OUT" as const,
        ref: t.ref,
        date: t.date,
        party: `Untuk: ${t.party}`,
        sub: t.section || "Pengeluaran Material Lapangan",
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  } catch (err: any) {
    console.error("Gagal mengambil data dari Turso DB:", err);
    dbError = err?.message || "Koneksi ke database Turso gagal.";
  }

  // Hitung metrik
  const totalItemCount = allItems.length;
  const totalStockSum = allItems.reduce((acc, curr) => acc + curr.currentStock, 0);
  const lowStockItems = allItems.filter(
    (item) => item.currentStock <= item.minimumStock
  );

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Dashboard Logistik Proyek
          </h1>
          <p className="text-sm text-slate-500">
            Monitoring inventaris material, arus pergerakan barang, dan indikator stok di lapangan.
          </p>
        </div>

        {/* Tombol Aksi Cepat */}
        <div className="flex items-center gap-2">
          <Link
            href="/incoming"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-xs transition-colors"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>Catat Masuk</span>
          </Link>
          <Link
            href="/outgoing"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-xs shadow-xs transition-colors"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Catat Keluar</span>
          </Link>
          <Link
            href="/reports"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs shadow-xs transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>Laporan Mutasi</span>
          </Link>
        </div>
      </div>

      {/* Pesan Error Koneksi Database Jika Env Vercel Belum Terbaca */}
      {dbError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 space-y-2">
          <div className="flex items-center space-x-2 font-bold text-rose-900">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Koneksi Database Turso Belum Terbaca di Vercel</span>
          </div>
          <p className="leading-relaxed">
            Penyebab: <strong>{dbError}</strong>. Silakan periksa menu <strong>Settings &rarr; Environment Variables</strong> di Vercel, pastikan <code>TURSO_DATABASE_URL</code> dan <code>TURSO_AUTH_TOKEN</code> sudah terisi, lalu lakukan <strong>Redeploy</strong>.
          </p>
        </div>
      )}

      {/* Grid 4 Kartu Metrik Utama */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metrik 1: Total Saldo Stok Fisik */}
        <Card className="hover:border-slate-300 transition-colors">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Total Saldo Stok
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {formatNumber(totalStockSum)}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {totalItemCount} jenis material
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Metrik 2: Total Akumulasi Barang Masuk */}
        <Card className="hover:border-slate-300 transition-colors">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-emerald-700 uppercase tracking-wider">
                Total Barang Masuk
              </p>
              <p className="text-2xl font-bold text-emerald-900 mt-1">
                +{formatNumber(Number(totalInQty))}
              </p>
              <p className="text-[11px] text-emerald-600 mt-0.5">
                Dari {supplierCount} rekanan vendor
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowDownLeft className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Metrik 3: Total Akumulasi Barang Keluar */}
        <Card className="hover:border-slate-300 transition-colors">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-amber-700 uppercase tracking-wider">
                Total Barang Keluar
              </p>
              <p className="text-2xl font-bold text-amber-900 mt-1">
                -{formatNumber(Number(totalOutQty))}
              </p>
              <p className="text-[11px] text-amber-600 mt-0.5">
                Dipakai untuk pekerjaan lapangan
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ArrowUpRight className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Metrik 4: Stok Kritis / Tipis */}
        <Card className={lowStockItems.length > 0 ? "border-rose-300 bg-rose-50/20" : ""}>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-rose-700 uppercase tracking-wider">
                Stok Kritis Lapangan
              </p>
              <p className="text-2xl font-bold text-rose-900 mt-1">
                {formatNumber(lowStockItems.length)}
              </p>
              <p className="text-[11px] text-rose-600 mt-0.5">
                {lowStockItems.length > 0
                  ? "Perlu segera order ulang"
                  : "Seluruh stok aman"}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid: Peringatan Stok & Aktivitas Terbaru */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri (2 span): Peringatan Stok & Tabel Katalog */}
        <div className="lg:col-span-2 space-y-6">
          {/* Peringatan Stok Kritis jika ada */}
          {lowStockItems.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 sm:p-5 flex items-start space-x-3.5">
              <div className="w-9 h-9 rounded-lg bg-amber-200 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-amber-900">
                  Perhatian: {lowStockItems.length} Material Berada di Bawah Batas Stok Minimum
                </h3>
                <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                  Material berikut perlu dipantau ketat atau dibuatkan Surat Jalan pengadaan baru:{" "}
                  <span className="font-semibold">
                    {lowStockItems
                      .map((i) => `${i.name} (Sisa: ${i.currentStock} ${i.unitSymbol})`)
                      .join(", ")}
                  </span>
                  .
                </p>
              </div>
              <Link
                href="/incoming"
                className="shrink-0 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium transition-colors"
              >
                Order Masuk
              </Link>
            </div>
          )}

          {/* Tabel Katalog Stok Fisik Terkini */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between py-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Status Stok Material Lapangan
                </h2>
                <p className="text-xs text-slate-500">
                  Data fisik terkini yang terverifikasi di gudang site proyek
                </p>
              </div>
              <Link
                href="/items"
                className="text-xs font-medium text-amber-600 hover:text-amber-700 hover:underline"
              >
                Lihat Semua &rarr;
              </Link>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-medium uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3">Kode</th>
                    <th className="px-5 py-3">Nama Material</th>
                    <th className="px-5 py-3 text-right">Stok Fisik</th>
                    <th className="px-5 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allItems.map((item) => {
                    const isLow = item.currentStock <= item.minimumStock;
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-3 font-mono text-xs font-semibold text-slate-600">
                          {item.code}
                        </td>
                        <td className="px-5 py-3 font-medium text-slate-900">
                          {item.name}
                        </td>
                        <td className="px-5 py-3 text-right font-bold text-slate-800">
                          {formatNumber(item.currentStock)}{" "}
                          <span className="text-xs font-normal text-slate-500">
                            {item.unitSymbol}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-center">
                          {isLow ? (
                            <Badge variant="danger">Kritis</Badge>
                          ) : (
                            <Badge variant="success">Aman</Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Kolom Kanan (1 span): Feed Aktivitas Transaksi Terbaru */}
        <div>
          <Card className="h-full flex flex-col">
            <CardHeader className="py-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-amber-600" />
                <h2 className="text-base font-semibold text-slate-900">
                  Aktivitas Logistik Terbaru
                </h2>
              </div>
              <p className="text-xs text-slate-400">
                Catatan mutasi masuk dan keluar terakhir
              </p>
            </CardHeader>
            <CardContent className="p-4 flex-1">
              {recentActivities.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-xs text-slate-400">
                  Belum ada transaksi logistik yang dicatat.
                </div>
              ) : (
                <div className="space-y-3.5">
                  {recentActivities.map((act) => (
                    <div
                      key={act.id}
                      className="p-3 rounded-lg border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-slate-800">
                          {act.ref}
                        </span>
                        {act.type === "IN" ? (
                          <Badge variant="success" className="text-[10px] px-2 py-0">
                            MASUK
                          </Badge>
                        ) : (
                          <Badge variant="warning" className="text-[10px] px-2 py-0">
                            KELUAR
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs font-medium text-slate-700 mt-1">
                        {act.party}
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1 border-t border-slate-200/50 pt-1">
                        <span className="truncate max-w-[150px]">{act.sub}</span>
                        <span>{formatDate(act.date)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
