"use client";

import React, { useState } from "react";
import { Eye, X, FileText } from "lucide-react";
import { formatDate, formatNumber } from "@/lib/utils";

interface TransactionDetailItem {
  id: number;
  itemName: string;
  itemCode: string;
  quantity: number;
  unitSymbol: string;
  notes?: string | null;
}

interface TransactionDetailDialogProps {
  title: string;
  referenceNumber: string;
  date: string;
  partyLabel: string;
  partyName: string;
  subInfoLabel?: string;
  subInfoValue?: string;
  notes?: string | null;
  items: TransactionDetailItem[];
}

export function TransactionDetailDialog({
  title,
  referenceNumber,
  date,
  partyLabel,
  partyName,
  subInfoLabel,
  subInfoValue,
  notes,
  items,
}: TransactionDetailDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
        title="Lihat Detail Transaksi"
      >
        <Eye className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">
                    {title}
                  </h3>
                  <p className="font-mono text-xs font-semibold text-amber-600">
                    {referenceNumber}
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

            {/* Info Transaksi */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-lg border border-slate-200/60">
                <div>
                  <span className="text-slate-400 block">Tanggal Transaksi:</span>
                  <span className="font-medium text-slate-800">
                    {formatDate(date)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">{partyLabel}:</span>
                  <span className="font-medium text-slate-800">{partyName}</span>
                </div>
                {subInfoLabel && subInfoValue && (
                  <div className="col-span-2 border-t border-slate-200/60 pt-2">
                    <span className="text-slate-400 block">{subInfoLabel}:</span>
                    <span className="font-medium text-slate-800">
                      {subInfoValue}
                    </span>
                  </div>
                )}
                {notes && (
                  <div className="col-span-2 border-t border-slate-200/60 pt-2">
                    <span className="text-slate-400 block">Catatan:</span>
                    <span className="text-slate-600 italic">{notes}</span>
                  </div>
                )}
              </div>

              {/* Rincian Material */}
              <div>
                <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2">
                  Daftar Material ({items.length} Macam)
                </h4>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-2.5">Material</th>
                        <th className="px-4 py-2.5 text-right">Jumlah</th>
                        <th className="px-4 py-2.5">Keterangan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {items.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50">
                          <td className="px-4 py-2.5">
                            <p className="font-semibold text-slate-800">
                              {item.itemName}
                            </p>
                            <p className="font-mono text-[10px] text-slate-400">
                              {item.itemCode}
                            </p>
                          </td>
                          <td className="px-4 py-2.5 text-right font-bold text-slate-900">
                            {formatNumber(item.quantity)} {item.unitSymbol}
                          </td>
                          <td className="px-4 py-2.5 text-slate-500">
                            {item.notes || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

