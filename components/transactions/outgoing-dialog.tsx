"use client";

import React, { useState, useTransition } from "react";
import { Plus, X, Trash2, ArrowUpRight, Loader2, AlertCircle } from "lucide-react";
import { createOutgoingTransaction } from "@/actions/transactions";

interface ItemOption {
  id: number;
  code: string;
  name: string;
  unitSymbol: string | null;
  currentStock: number;
}

interface RowItem {
  itemId: number;
  quantity: number;
  notes: string;
}

interface OutgoingDialogProps {
  items: ItemOption[];
}

export function OutgoingDialog({ items }: OutgoingDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const todayStr = new Date().toISOString().split("T")[0];
  const [referenceNumber, setReferenceNumber] = useState("");
  const [transactionDate, setTransactionDate] = useState(todayStr);
  const [recipientName, setRecipientName] = useState("");
  const [projectSection, setProjectSection] = useState("");
  const [notes, setNotes] = useState("");

  // Dynamic Item Rows
  const [rows, setRows] = useState<RowItem[]>([
    { itemId: items[0]?.id || 0, quantity: 1, notes: "" },
  ]);

  const addRow = () => {
    setRows([...rows, { itemId: items[0]?.id || 0, quantity: 1, notes: "" }]);
  };

  const removeRow = (index: number) => {
    if (rows.length === 1) return;
    setRows(rows.filter((_, i) => i !== index));
  };

  const updateRow = (index: number, field: keyof RowItem, value: any) => {
    const updated = [...rows];
    updated[index] = { ...updated[index], [field]: value };
    setRows(updated);
  };

  // Cek apakah ada baris yang kuantitasnya melebihi stok yang tersedia
  const hasInsufficientStock = rows.some((row) => {
    const item = items.find((i) => i.id === row.itemId);
    return !item || row.quantity > item.currentStock;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (hasInsufficientStock) {
      setErrorMessage(
        "Terdapat permintaan material yang melebihi saldo stok yang tersedia di gudang!"
      );
      return;
    }

    startTransition(async () => {
      const res = await createOutgoingTransaction({
        referenceNumber,
        transactionDate,
        recipientName,
        projectSection,
        notes,
        itemsList: rows,
      });

      if (res.success) {
        setIsOpen(false);
        setReferenceNumber("");
        setRecipientName("");
        setProjectSection("");
        setNotes("");
        setRows([{ itemId: items[0]?.id || 0, quantity: 1, notes: "" }]);
      } else {
        setErrorMessage(res.message);
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-xs shadow-xs transition-colors"
      >
        <Plus className="w-4 h-4" />
        <span>Catat Pengeluaran Barang Keluar</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-base">
                    Catat Pengeluaran Barang Keluar (SPB)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Sistem otomatis memverifikasi stok dan mengurangi saldo di gudang
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto p-6 space-y-5"
            >
              {errorMessage && (
                <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Data Pengeluaran */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    No. SPB / Bukti Pengeluaran *
                  </label>
                  <input
                    type="text"
                    required
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    placeholder="Contoh: SPB-2026/042"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Tanggal Pengeluaran Material *
                  </label>
                  <input
                    type="date"
                    required
                    value={transactionDate}
                    onChange={(e) => setTransactionDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Nama Mandor / Peminta Material *
                  </label>
                  <input
                    type="text"
                    required
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Contoh: Mandor Bpk. Rohman (Struktur)"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Alokasi Bagian Proyek / Zona Kerja *
                  </label>
                  <input
                    type="text"
                    required
                    value={projectSection}
                    onChange={(e) => setProjectSection(e.target.value)}
                    placeholder="Contoh: Pengecoran Kolom Lt. 2 Zona B"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Catatan / Keterangan Keperluan Lapangan
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: Kebutuhan mendesak sebelum pengecoran malam hari"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Dynamic Rows Material yang Dikeluarkan */}
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                    Daftar Material yang Dikeluarkan
                  </label>
                  <button
                    type="button"
                    onClick={addRow}
                    className="inline-flex items-center space-x-1 text-xs font-medium text-amber-700 hover:text-amber-800 hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Baris</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {rows.map((row, idx) => {
                    const selectedItem = items.find((i) => i.id === row.itemId);
                    const stockAvailable = selectedItem ? selectedItem.currentStock : 0;
                    const isExceeding = row.quantity > stockAvailable;

                    return (
                      <div
                        key={idx}
                        className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 rounded-lg border ${
                          isExceeding
                            ? "bg-rose-50 border-rose-200"
                            : "bg-slate-50 border-slate-200"
                        }`}
                      >
                        {/* Pilih Material */}
                        <div className="flex-1">
                          <select
                            value={row.itemId}
                            onChange={(e) =>
                              updateRow(idx, "itemId", Number(e.target.value))
                            }
                            className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                          >
                            {items.map((it) => (
                              <option key={it.id} value={it.id}>
                                [{it.code}] {it.name} (Tersedia: {it.currentStock} {it.unitSymbol})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Jumlah Keluar */}
                        <div className="w-full sm:w-36 flex flex-col">
                          <div className="flex items-center space-x-1.5">
                            <input
                              type="number"
                              min="1"
                              required
                              value={row.quantity}
                              onChange={(e) =>
                                updateRow(idx, "quantity", Number(e.target.value))
                              }
                              placeholder="Qty"
                              className={`w-full px-2.5 py-1.5 text-xs border rounded-md focus:outline-none focus:ring-2 ${
                                isExceeding
                                  ? "border-rose-400 focus:ring-rose-500 text-rose-700 bg-rose-50"
                                  : "border-slate-300 focus:ring-amber-500"
                              }`}
                            />
                            <span className="text-[11px] text-slate-500 font-medium shrink-0">
                              {selectedItem?.unitSymbol || ""}
                            </span>
                          </div>
                          {isExceeding && (
                            <span className="text-[10px] text-rose-600 font-medium mt-1">
                              Maks: {stockAvailable} {selectedItem?.unitSymbol}
                            </span>
                          )}
                        </div>

                        {/* Catatan Item */}
                        <div className="flex-1">
                          <input
                            type="text"
                            value={row.notes}
                            onChange={(e) =>
                              updateRow(idx, "notes", e.target.value)
                            }
                            placeholder="Catatan pengambilan (opsional)"
                            className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                        </div>

                        {/* Hapus Baris */}
                        {rows.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeRow(idx)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md transition-colors self-end sm:self-center"
                            title="Hapus Baris"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={isPending}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending || hasInsufficientStock}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-xs"
                >
                  {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Keluarkan Material</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

