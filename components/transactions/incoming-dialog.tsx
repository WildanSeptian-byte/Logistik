"use client";

import React, { useState, useTransition } from "react";
import { Plus, X, Trash2, ArrowDownLeft, Loader2 } from "lucide-react";
import { createIncomingTransaction } from "@/actions/transactions";

interface SupplierOption {
  id: number;
  name: string;
}

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

interface IncomingDialogProps {
  suppliers: SupplierOption[];
  items: ItemOption[];
}

export function IncomingDialog({ suppliers, items }: IncomingDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const todayStr = new Date().toISOString().split("T")[0];
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [supplierId, setSupplierId] = useState<number>(suppliers[0]?.id || 0);
  const [transactionDate, setTransactionDate] = useState(todayStr);
  const [recipientName, setRecipientName] = useState("Staf Logistik Proyek");
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    startTransition(async () => {
      const res = await createIncomingTransaction({
        invoiceNumber,
        supplierId,
        transactionDate,
        recipientName,
        notes,
        itemsList: rows,
      });

      if (res.success) {
        setIsOpen(false);
        setInvoiceNumber("");
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
        className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-xs transition-colors"
      >
        <Plus className="w-4 h-4" />
        <span>Catat Penerimaan Barang Masuk</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <ArrowDownLeft className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-base">
                    Catat Barang Masuk (Surat Jalan)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Material yang dicatat akan otomatis menambah saldo stok fisik di gudang
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
                <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
                  {errorMessage}
                </div>
              )}

              {/* Data Surat Jalan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    No. Surat Jalan / No. DO *
                  </label>
                  <input
                    type="text"
                    required
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    placeholder="Contoh: SJ-SMN-2026/089"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Supplier / Vendor Pengirim *
                  </label>
                  <select
                    value={supplierId}
                    onChange={(e) => setSupplierId(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Tanggal Kedatangan di Proyek *
                  </label>
                  <input
                    type="date"
                    required
                    value={transactionDate}
                    onChange={(e) => setTransactionDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Nama Petugas Penerima Lapangan *
                  </label>
                  <input
                    type="text"
                    required
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Catatan Pengiriman / No. Truk Ekspedisi
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: Truk Tronton B 9123 XYZ, kondisi sak semen kering dan baik"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Dynamic Rows Material yang Diterima */}
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                    Daftar Material yang Diterima
                  </label>
                  <button
                    type="button"
                    onClick={addRow}
                    className="inline-flex items-center space-x-1 text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Baris</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {rows.map((row, idx) => {
                    const selectedItem = items.find((i) => i.id === row.itemId);

                    return (
                      <div
                        key={idx}
                        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg"
                      >
                        {/* Pilih Material */}
                        <div className="flex-1">
                          <select
                            value={row.itemId}
                            onChange={(e) =>
                              updateRow(idx, "itemId", Number(e.target.value))
                            }
                            className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          >
                            {items.map((it) => (
                              <option key={it.id} value={it.id}>
                                [{it.code}] {it.name} (Stok Saat Ini: {it.currentStock} {it.unitSymbol})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Jumlah Diterima */}
                        <div className="w-full sm:w-28 flex items-center space-x-1.5">
                          <input
                            type="number"
                            min="1"
                            required
                            value={row.quantity}
                            onChange={(e) =>
                              updateRow(idx, "quantity", Number(e.target.value))
                            }
                            placeholder="Qty"
                            className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                          <span className="text-[11px] text-slate-500 font-medium shrink-0">
                            {selectedItem?.unitSymbol || ""}
                          </span>
                        </div>

                        {/* Catatan Item */}
                        <div className="flex-1">
                          <input
                            type="text"
                            value={row.notes}
                            onChange={(e) =>
                              updateRow(idx, "notes", e.target.value)
                            }
                            placeholder="Keterangan item (opsional)"
                            className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                  disabled={isPending}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-xs"
                >
                  {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Simpan Penerimaan Material</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

