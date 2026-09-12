"use client";

import React, { useState } from "react";
import {
  Printer,
  Calendar,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  HardHat,
  RotateCcw,
  CheckSquare,
  Square,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatNumber } from "@/lib/utils";

interface ItemData {
  id: number;
  code: string;
  name: string;
  unitSymbol: string | null;
  currentStock: number;
  minimumStock: number;
}

interface InMovement {
  id: number;
  date: string;
  ref: string;
  supplier: string;
  itemId: number;
  quantity: number;
  notes: string | null;
}

interface OutMovement {
  id: number;
  date: string;
  ref: string;
  recipient: string;
  section: string;
  itemId: number;
  quantity: number;
  notes: string | null;
}

interface ReportViewProps {
  items: ItemData[];
  incomingMovements: InMovement[];
  outgoingMovements: OutMovement[];
}

// Fungsi normalisasi tanggal ke format standar YYYY-MM-DD
function toDateString(d: Date | string): string {
  if (!d) return "";
  if (typeof d === "string") {
    // Ambil hanya bagian YYYY-MM-DD
    return d.split("T")[0].split(" ")[0].trim();
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function ReportView({
  items,
  incomingMovements,
  outgoingMovements,
}: ReportViewProps) {
  const today = new Date();
  const todayStr = toDateString(today);

  // State Filter
  const [filterMode, setFilterMode] = useState<"single" | "range">("single");
  const [singleDate, setSingleDate] = useState<string>(todayStr);
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return toDateString(d);
  });
  const [endDate, setEndDate] = useState<string>(todayStr);
  const [selectedItemId, setSelectedItemId] = useState<string>("ALL");
  const [onlyMutated, setOnlyMutated] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"rekap" | "detail">("rekap");

  // Tentukan batas tanggal aktif berdasarkan mode (single date atau range)
  const activeStart = filterMode === "single" ? singleDate : startDate;
  const activeEnd = filterMode === "single" ? singleDate : endDate;

  // Filter Mutasi Masuk
  const filteredIn = incomingMovements.filter((m) => {
    const mDate = toDateString(m.date);
    const dateMatch =
      (!activeStart || mDate >= activeStart) &&
      (!activeEnd || mDate <= activeEnd);
    const itemMatch =
      selectedItemId === "ALL" || m.itemId === Number(selectedItemId);
    return dateMatch && itemMatch;
  });

  // Filter Mutasi Keluar
  const filteredOut = outgoingMovements.filter((m) => {
    const mDate = toDateString(m.date);
    const dateMatch =
      (!activeStart || mDate >= activeStart) &&
      (!activeEnd || mDate <= activeEnd);
    const itemMatch =
      selectedItemId === "ALL" || m.itemId === Number(selectedItemId);
    return dateMatch && itemMatch;
  });

  // Hitung data rekapitulasi mutasi per item
  const rawRekapData = items
    .filter((item) => selectedItemId === "ALL" || item.id === Number(selectedItemId))
    .map((item) => {
      const itemInTotal = filteredIn
        .filter((m) => m.itemId === item.id)
        .reduce((sum, curr) => sum + curr.quantity, 0);

      const itemOutTotal = filteredOut
        .filter((m) => m.itemId === item.id)
        .reduce((sum, curr) => sum + curr.quantity, 0);

      return {
        ...item,
        totalIn: itemInTotal,
        totalOut: itemOutTotal,
      };
    });

  // Jika onlyMutated aktif, hanya tampilkan barang yang ADA mutasi masuk atau keluar
  const rekapData = onlyMutated
    ? rawRekapData.filter((item) => item.totalIn > 0 || item.totalOut > 0)
    : rawRekapData;

  // Log gabungan kronologis untuk Tab Detail
  const allChronologicalMovements = [
    ...filteredIn.map((m) => ({
      id: `in-${m.id}`,
      type: "IN" as const,
      date: toDateString(m.date),
      ref: m.ref,
      party: m.supplier,
      info: "Penerimaan Surat Jalan",
      itemId: m.itemId,
      quantity: m.quantity,
      notes: m.notes,
    })),
    ...filteredOut.map((m) => ({
      id: `out-${m.id}`,
      type: "OUT" as const,
      date: toDateString(m.date),
      ref: m.ref,
      party: m.recipient,
      info: m.section,
      itemId: m.itemId,
      quantity: m.quantity,
      notes: m.notes,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Presets tanggal cepat
  const applyPreset = (preset: "today" | "yesterday" | "7days" | "month" | "all") => {
    const now = new Date();
    if (preset === "today") {
      setFilterMode("single");
      setSingleDate(todayStr);
    } else if (preset === "yesterday") {
      setFilterMode("single");
      const y = new Date();
      y.setDate(now.getDate() - 1);
      setSingleDate(toDateString(y));
    } else if (preset === "7days") {
      setFilterMode("range");
      const d = new Date();
      d.setDate(now.getDate() - 7);
      setStartDate(toDateString(d));
      setEndDate(todayStr);
    } else if (preset === "month") {
      setFilterMode("range");
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      setStartDate(toDateString(firstDay));
      setEndDate(todayStr);
    } else if (preset === "all") {
      setFilterMode("range");
      setStartDate("2020-01-01");
      setEndDate(todayStr);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* PANEL KONTROL FILTER (Disembunyikan saat dicetak / print:hidden) */}
      {/* ========================================================= */}
      <div className="print:hidden space-y-4">
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-amber-600" />
              <span className="font-bold text-slate-800 text-sm">
                Pengaturan Periode & Parameter Laporan
              </span>
            </div>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Laporan / Simpan PDF</span>
            </button>
          </div>

          {/* Pilihan Mode Filter: Satu Hari vs Rentang Periode */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-medium text-slate-500 mr-2">
              Mode Waktu:
            </span>
            <button
              type="button"
              onClick={() => setFilterMode("single")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterMode === "single"
                  ? "bg-amber-500 text-slate-950 font-bold shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              📅 Satu Hari Tertentu
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("range")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterMode === "range"
                  ? "bg-amber-500 text-slate-950 font-bold shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              🗓️ Rentang Tanggal (Periode)
            </button>

            {/* Tombol Pintas Preset Tanggal */}
            <div className="hidden md:flex items-center gap-1.5 pl-4 border-l border-slate-200">
              <span className="text-[11px] text-slate-400">Pintas:</span>
              <button
                type="button"
                onClick={() => applyPreset("today")}
                className="px-2.5 py-1 text-[11px] bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-slate-700"
              >
                Hari Ini
              </button>
              <button
                type="button"
                onClick={() => applyPreset("yesterday")}
                className="px-2.5 py-1 text-[11px] bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-slate-700"
              >
                Kemarin
              </button>
              <button
                type="button"
                onClick={() => applyPreset("7days")}
                className="px-2.5 py-1 text-[11px] bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-slate-700"
              >
                7 Hari
              </button>
              <button
                type="button"
                onClick={() => applyPreset("month")}
                className="px-2.5 py-1 text-[11px] bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-slate-700"
              >
                Bulan Ini
              </button>
              <button
                type="button"
                onClick={() => applyPreset("all")}
                className="px-2.5 py-1 text-[11px] bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-slate-700"
              >
                Semua
              </button>
            </div>
          </div>

          {/* Form Filter Dinamis */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            {filterMode === "single" ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pilih Tanggal Laporan:
                </label>
                <input
                  type="date"
                  value={singleDate}
                  onChange={(e) => setSingleDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Dari Tanggal:
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Sampai Tanggal:
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  />
                </div>
              </>
            )}

            {/* Filter Material */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Filter Material:
              </label>
              <select
                value={selectedItemId}
                onChange={(e) => setSelectedItemId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
              >
                <option value="ALL">Semua Material Proyek ({items.length})</option>
                {items.map((i) => (
                  <option key={i.id} value={i.id}>
                    [{i.code}] {i.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Opsi Tampilan: Hanya Material yang Bermutasi */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setOnlyMutated(!onlyMutated)}
              className="flex items-center space-x-2 text-xs text-slate-700 hover:text-slate-900 cursor-pointer select-none"
            >
              {onlyMutated ? (
                <CheckSquare className="w-4 h-4 text-amber-600 shrink-0" />
              ) : (
                <Square className="w-4 h-4 text-slate-400 shrink-0" />
              )}
              <span className="font-medium">
                Hanya tampilkan material yang memiliki pergerakan (Barang Masuk / Keluar) pada tanggal ini
              </span>
            </button>

            {/* Status Hasil Filter */}
            <div className="text-xs text-slate-500 font-medium">
              Ditemukan:{" "}
              <span className="font-bold text-emerald-700">
                {filteredIn.length} Masuk
              </span>{" "}
              &bull;{" "}
              <span className="font-bold text-amber-700">
                {filteredOut.length} Keluar
              </span>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex border-b border-slate-100 pt-3 gap-6">
            <button
              type="button"
              onClick={() => setActiveTab("rekap")}
              className={`pb-2.5 text-xs font-bold border-b-2 transition-colors ${
                activeTab === "rekap"
                  ? "border-amber-500 text-slate-900"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              Tabel Rekapitulasi Mutasi ({rekapData.length} Material)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("detail")}
              className={`pb-2.5 text-xs font-bold border-b-2 transition-colors ${
                activeTab === "detail"
                  ? "border-amber-500 text-slate-900"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              Log Detail Transaksi Masuk & Keluar ({allChronologicalMovements.length})
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* AREA CETAK LAPORAN RESMI (Tampil Bagus di Layar & Print PDF) */}
      {/* ========================================================= */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-8 shadow-2xs print:border-none print:shadow-none print:p-0">
        {/* KOP Surat Resmi Proyek */}
        <div className="border-b-2 border-slate-900 pb-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0">
                <HardHat className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 uppercase">
                  LAPORAN MUTASI & REKAPITULASI LOGISTIK PROYEK
                </h1>
                <p className="text-xs text-slate-600">
                  Proyek Pembangunan Gedung Bertingkat &bull; Site Logistics Office
                </p>
              </div>
            </div>
            <div className="text-left sm:text-right text-[11px] text-slate-500 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
              <p>
                Periode Laporan:{" "}
                <span className="font-bold text-slate-900">
                  {filterMode === "single"
                    ? formatDate(activeStart)
                    : `${formatDate(activeStart)} s/d ${formatDate(activeEnd)}`}
                </span>
              </p>
              <p>Dicetak: {formatDate(today)}</p>
            </div>
          </div>
        </div>

        {/* KONTEN TAB 1: REKAPITULASI STOK */}
        {(activeTab === "rekap" || typeof window !== "undefined") && (
          <div className={activeTab === "rekap" ? "block" : "hidden print:block"}>
            <div className="flex items-center justify-between gap-2 mb-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                I. Ringkasan Rekapitulasi Arus Stok Material
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 print:hidden hidden sm:inline">
                  {onlyMutated
                    ? "(Menampilkan material yang bermutasi)"
                    : "(Menampilkan seluruh katalog)"}
                </span>
                <span className="sm:hidden inline-flex items-center gap-1 text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/80 font-medium">
                  ↔ Geser tabel ke kanan
                </span>
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-2.5 text-center w-10 whitespace-nowrap">No</th>
                      <th className="px-4 py-2.5 whitespace-nowrap">Kode Material</th>
                      <th className="px-4 py-2.5 whitespace-nowrap min-w-[160px]">Nama Material</th>
                      <th className="px-4 py-2.5 text-right text-emerald-700 bg-emerald-50/60 whitespace-nowrap">
                        Barang Masuk
                      </th>
                      <th className="px-4 py-2.5 text-right text-amber-700 bg-amber-50/60 whitespace-nowrap">
                        Barang Keluar
                      </th>
                      <th className="px-4 py-2.5 text-right font-bold whitespace-nowrap">
                        Saldo Fisik Gudang
                      </th>
                      <th className="px-4 py-2.5 text-center whitespace-nowrap">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {rekapData.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-6 py-12 text-center text-slate-400 text-xs"
                        >
                          <p className="font-semibold text-slate-600 text-sm">
                            Tidak ada aktivitas mutasi barang masuk atau keluar
                          </p>
                          <p className="mt-1 text-slate-400">
                            Pada periode tanggal{" "}
                            <span className="font-medium text-slate-600">
                              {filterMode === "single"
                                ? formatDate(activeStart)
                                : `${formatDate(activeStart)} s/d ${formatDate(activeEnd)}`}
                            </span>
                          </p>
                          {onlyMutated && (
                            <button
                              type="button"
                              onClick={() => setOnlyMutated(false)}
                              className="mt-3 text-xs text-amber-600 hover:underline print:hidden font-medium cursor-pointer"
                            >
                              Klik di sini untuk melihat saldo seluruh katalog barang &rarr;
                            </button>
                          )}
                        </td>
                      </tr>
                    ) : (
                      rekapData.map((item, idx) => {
                        const isLow = item.currentStock <= item.minimumStock;
                        return (
                          <tr key={item.id} className="hover:bg-slate-50/50">
                            <td className="px-4 py-2.5 text-slate-500 text-center whitespace-nowrap">
                              {idx + 1}
                            </td>
                            <td className="px-4 py-2.5 font-mono font-medium text-slate-700 whitespace-nowrap">
                              {item.code}
                            </td>
                            <td className="px-4 py-2.5 font-semibold text-slate-900">
                              {item.name}
                            </td>
                            <td className="px-4 py-2.5 text-right text-emerald-700 font-bold whitespace-nowrap">
                              {item.totalIn > 0 ? `+${formatNumber(item.totalIn)}` : "0"}{" "}
                              <span className="text-[10px] text-slate-400 font-normal">
                                {item.unitSymbol}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-right text-amber-700 font-bold whitespace-nowrap">
                              {item.totalOut > 0 ? `-${formatNumber(item.totalOut)}` : "0"}{" "}
                              <span className="text-[10px] text-slate-400 font-normal">
                                {item.unitSymbol}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-right font-black text-slate-900 whitespace-nowrap">
                              {formatNumber(item.currentStock)}{" "}
                              <span className="text-[10px] font-normal text-slate-500">
                                {item.unitSymbol}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-center whitespace-nowrap">
                              {isLow ? (
                                <Badge variant="danger" className="text-[10px] py-0">
                                  Stok Kritis
                                </Badge>
                              ) : (
                                <Badge variant="success" className="text-[10px] py-0">
                                  Aman
                                </Badge>
                              )}
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
        )}

        {/* KONTEN TAB 2: LOG DETAIL TRANSAKSI */}
        {(activeTab === "detail" || typeof window !== "undefined") && (
          <div
            className={`mt-6 ${
              activeTab === "detail" ? "block" : "hidden print:block"
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                II. Rincian Kronologis Mutasi Transaksi
              </h3>
              <span className="sm:hidden inline-flex items-center gap-1 text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/80 font-medium">
                ↔ Geser tabel ke kanan
              </span>
            </div>
            <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2.5 whitespace-nowrap">Tanggal</th>
                      <th className="px-3 py-2.5 text-center whitespace-nowrap">Jenis</th>
                      <th className="px-3 py-2.5 whitespace-nowrap">No. Referensi (SJ / SPB)</th>
                      <th className="px-3 py-2.5 whitespace-nowrap">Pihak / Alokasi Proyek</th>
                      <th className="px-3 py-2.5 whitespace-nowrap">Material</th>
                      <th className="px-3 py-2.5 text-right whitespace-nowrap">Kuantitas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {allChronologicalMovements.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-8 text-center text-slate-400 text-xs"
                        >
                          Tidak ada transaksi surat jalan masuk atau SPB keluar pada tanggal yang dipilih.
                        </td>
                      </tr>
                    ) : (
                      allChronologicalMovements.map((mov) => {
                        const item = items.find((i) => i.id === mov.itemId);
                        return (
                          <tr key={mov.id} className="hover:bg-slate-50/50">
                            <td className="px-3 py-2 text-slate-600 font-medium whitespace-nowrap">
                              {formatDate(mov.date)}
                            </td>
                            <td className="px-3 py-2 text-center whitespace-nowrap">
                              {mov.type === "IN" ? (
                                <span className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                                  MASUK
                                </span>
                              ) : (
                                <span className="inline-block px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">
                                  KELUAR
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-2 font-mono font-bold text-slate-800 whitespace-nowrap">
                              {mov.ref}
                            </td>
                            <td className="px-3 py-2 text-slate-700 whitespace-nowrap">
                              <span className="font-semibold">{mov.party}</span>
                              <span className="block text-[10px] text-slate-400">
                                {mov.info}
                              </span>
                            </td>
                            <td className="px-3 py-2 font-semibold text-slate-800">
                              {item?.name || "Material"}
                            </td>
                            <td className="px-3 py-2 text-right font-black text-slate-900 whitespace-nowrap">
                              {mov.type === "IN" ? "+" : "-"}
                              {formatNumber(mov.quantity)} {item?.unitSymbol || ""}
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
        )}

        {/* BAGIAN TANDA TANGAN RESMI */}
        <div className="mt-12 pt-6 border-t border-slate-200 grid grid-cols-2 text-center text-xs">
          <div>
            <p className="text-slate-500 mb-16">Disiapkan oleh,</p>
            <p className="font-bold text-slate-900 underline">
              Staf Logistik Proyek
            </p>
            <p className="text-[10px] text-slate-400">Logistics & Materials Admin</p>
          </div>
          <div>
            <p className="text-slate-500 mb-16">Disetujui oleh,</p>
            <p className="font-bold text-slate-900 underline">
              Site Manager / Project Manager
            </p>
            <p className="text-[10px] text-slate-400">Pimpinan Proyek Konstruksi</p>
          </div>
        </div>
      </div>
    </div>
  );
}
