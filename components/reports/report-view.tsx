"use client";

import React, { useState } from "react";
import {
  Printer,
  Calendar,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  FileSpreadsheet,
  Building2,
  HardHat,
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

export function ReportView({
  items,
  incomingMovements,
  outgoingMovements,
}: ReportViewProps) {
  // Default rentang tanggal: 30 hari terakhir sampai hari ini
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const [startDate, setStartDate] = useState(
    thirtyDaysAgo.toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(today.toISOString().split("T")[0]);
  const [selectedItemId, setSelectedItemId] = useState<string>("ALL");
  const [activeTab, setActiveTab] = useState<"rekap" | "detail">("rekap");

  // Filter Mutasi Masuk berdasarkan periode dan item
  const filteredIn = incomingMovements.filter((m) => {
    const inDate = m.date >= startDate && m.date <= endDate;
    const inItem =
      selectedItemId === "ALL" || m.itemId === Number(selectedItemId);
    return inDate && inItem;
  });

  // Filter Mutasi Keluar berdasarkan periode dan item
  const filteredOut = outgoingMovements.filter((m) => {
    const inDate = m.date >= startDate && m.date <= endDate;
    const inItem =
      selectedItemId === "ALL" || m.itemId === Number(selectedItemId);
    return inDate && inItem;
  });

  // Hitung agregat mutasi per item untuk tabel rekapitulasi
  const rekapData = items
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

  // Gabungkan seluruh log mutasi secara kronologis untuk tab Detail
  const allChronologicalMovements = [
    ...filteredIn.map((m) => ({
      id: `in-${m.id}`,
      type: "IN" as const,
      date: m.date,
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
      date: m.date,
      ref: m.ref,
      party: m.recipient,
      info: m.section,
      itemId: m.itemId,
      quantity: m.quantity,
      notes: m.notes,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Tombol Cetak & Filter (Disembunyikan saat dicetak / print:hidden) */}
      <div className="print:hidden space-y-4">
        {/* Panel Filter Tanggal & Material */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2 text-slate-700 font-medium text-xs">
              <Filter className="w-4 h-4 text-amber-600" />
              <span>Filter Periode & Parameter Laporan:</span>
            </div>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Laporan / Simpan PDF</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Tanggal Mulai */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Dari Tanggal:
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Tanggal Sampai */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Sampai Tanggal:
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Filter Material */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Pilih Material:
              </label>
              <select
                value={selectedItemId}
                onChange={(e) => setSelectedItemId(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="ALL">Semua Material Proyek</option>
                {items.map((i) => (
                  <option key={i.id} value={i.id}>
                    [{i.code}] {i.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex border-b border-slate-100 pt-2 gap-4">
            <button
              type="button"
              onClick={() => setActiveTab("rekap")}
              className={`pb-2 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === "rekap"
                  ? "border-amber-500 text-slate-900"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              Tabel Rekapitulasi Mutasi Stok
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("detail")}
              className={`pb-2 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === "detail"
                  ? "border-amber-500 text-slate-900"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              Log Kronologis Transaksi Masuk & Keluar ({allChronologicalMovements.length})
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* AREA CETAK LAPORAN RESMI (Tampil Bagus di Layar & Print PDF) */}
      {/* ========================================================= */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-2xs print:border-none print:shadow-none print:p-0">
        {/* KOP Surat Resmi Proyek (Muncul saat print & layar) */}
        <div className="border-b-2 border-slate-900 pb-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                <HardHat className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight text-slate-900 uppercase">
                  LAPORAN MUTASI & REKAPITULASI LOGISTIK PROYEK
                </h1>
                <p className="text-xs text-slate-600">
                  Proyek Pembangunan Gedung Bertingkat &bull; Site Logistics Office
                </p>
              </div>
            </div>
            <div className="text-right text-[11px] text-slate-500">
              <p>
                Periode:{" "}
                <span className="font-semibold text-slate-800">
                  {formatDate(startDate)} s/d {formatDate(endDate)}
                </span>
              </p>
              <p>Dicetak: {formatDate(today)}</p>
            </div>
          </div>
        </div>

        {/* KONTEN TAB 1: REKAPITULASI STOK */}
        {(activeTab === "rekap" || typeof window !== "undefined") && (
          <div className={activeTab === "rekap" ? "block" : "hidden print:block"}>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              I. Ringkasan Rekapitulasi Arus Stok Material
            </h3>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-2.5">No</th>
                    <th className="px-4 py-2.5">Kode Material</th>
                    <th className="px-4 py-2.5">Nama Material</th>
                    <th className="px-4 py-2.5 text-right text-emerald-700 bg-emerald-50/50">
                      Masuk Periode Ini
                    </th>
                    <th className="px-4 py-2.5 text-right text-amber-700 bg-amber-50/50">
                      Keluar Periode Ini
                    </th>
                    <th className="px-4 py-2.5 text-right font-bold">
                      Saldo Fisik Terkini
                    </th>
                    <th className="px-4 py-2.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {rekapData.map((item, idx) => {
                    const isLow = item.currentStock <= item.minimumStock;
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-2.5 text-slate-500 text-center w-10">
                          {idx + 1}
                        </td>
                        <td className="px-4 py-2.5 font-mono font-medium text-slate-700">
                          {item.code}
                        </td>
                        <td className="px-4 py-2.5 font-semibold text-slate-900">
                          {item.name}
                        </td>
                        <td className="px-4 py-2.5 text-right text-emerald-700 font-medium">
                          {item.totalIn > 0 ? `+${formatNumber(item.totalIn)}` : "0"}{" "}
                          <span className="text-[10px] text-slate-400">
                            {item.unitSymbol}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-right text-amber-700 font-medium">
                          {item.totalOut > 0 ? `-${formatNumber(item.totalOut)}` : "0"}{" "}
                          <span className="text-[10px] text-slate-400">
                            {item.unitSymbol}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-right font-black text-slate-900">
                          {formatNumber(item.currentStock)}{" "}
                          <span className="text-[10px] font-normal text-slate-500">
                            {item.unitSymbol}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-center">
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
                  })}
                </tbody>
              </table>
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
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              II. Rincian Kronologis Mutasi Transaksi
            </h3>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2.5">Tanggal</th>
                    <th className="px-3 py-2.5">Tipe</th>
                    <th className="px-3 py-2.5">No. Referensi</th>
                    <th className="px-3 py-2.5">Pihak / Alokasi</th>
                    <th className="px-3 py-2.5">Material</th>
                    <th className="px-3 py-2.5 text-right">Kuantitas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {allChronologicalMovements.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-8 text-center text-slate-400 text-xs"
                      >
                        Tidak ada transaksi mutasi pada rentang tanggal yang dipilih.
                      </td>
                    </tr>
                  ) : (
                    allChronologicalMovements.map((mov) => {
                      const item = items.find((i) => i.id === mov.itemId);
                      return (
                        <tr key={mov.id} className="hover:bg-slate-50/50">
                          <td className="px-3 py-2 text-slate-600">
                            {formatDate(mov.date)}
                          </td>
                          <td className="px-3 py-2">
                            {mov.type === "IN" ? (
                              <span className="text-emerald-700 font-bold">
                                MASUK
                              </span>
                            ) : (
                              <span className="text-amber-700 font-bold">
                                KELUAR
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2 font-mono text-slate-800">
                            {mov.ref}
                          </td>
                          <td className="px-3 py-2 text-slate-700">
                            <span className="font-medium">{mov.party}</span>
                            <span className="block text-[10px] text-slate-400">
                              {mov.info}
                            </span>
                          </td>
                          <td className="px-3 py-2 font-semibold text-slate-800">
                            {item?.name || "Material"}
                          </td>
                          <td className="px-3 py-2 text-right font-bold text-slate-900">
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
        )}

        {/* BAGIAN TANDA TANGAN RESMI (Sangat Bagus untuk Laporan KP & Cetak Dokumen) */}
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

