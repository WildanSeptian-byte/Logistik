"use client";

import React, { useState, useTransition } from "react";
import { Plus, X, Edit3, Loader2 } from "lucide-react";
import { createItem, updateItem } from "@/actions/items";

interface OptionItem {
  id: number;
  name: string;
  symbol?: string;
}

interface ItemData {
  id: number;
  code: string;
  name: string;
  categoryId: number;
  unitId: number;
  locationId?: number | null;
  currentStock: number;
  minimumStock: number;
  description?: string | null;
}

interface ItemDialogProps {
  mode: "create" | "edit";
  itemToEdit?: ItemData;
  categories: OptionItem[];
  units: OptionItem[];
  locations: OptionItem[];
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function ItemDialog({
  mode,
  itemToEdit,
  categories,
  units,
  locations,
  trigger,
  onSuccess,
}: ItemDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isEdit = mode === "edit";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      let res;
      if (isEdit && itemToEdit) {
        res = await updateItem(itemToEdit.id, formData);
      } else {
        res = await createItem(formData);
      }

      if (res.success) {
        setIsOpen(false);
        form.reset();
        if (onSuccess) onSuccess();
      } else {
        setErrorMessage(res.message);
      }
    });
  };

  return (
    <>
      {trigger ? (
        <span onClick={() => setIsOpen(true)}>{trigger}</span>
      ) : isEdit ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-slate-100 rounded-lg transition-colors"
          title="Edit Material"
        >
          <Edit3 className="w-4 h-4" />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-medium text-xs shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Material</span>
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-semibold text-slate-900 text-base">
                {isEdit ? "Edit Data Material" : "Tambah Material Baru"}
              </h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errorMessage && (
                <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
                  {errorMessage}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {/* Kode Material */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Kode Material *
                  </label>
                  <input
                    type="text"
                    name="code"
                    required
                    defaultValue={itemToEdit?.code || ""}
                    placeholder="Contoh: MAT-SMN-02"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Nama Material */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Nama Material *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    defaultValue={itemToEdit?.name || ""}
                    placeholder="Contoh: Semen Gresik 50kg"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Kategori */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Kategori *
                  </label>
                  <select
                    name="categoryId"
                    required
                    defaultValue={itemToEdit?.categoryId || categories[0]?.id || ""}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Satuan */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Satuan *
                  </label>
                  <select
                    name="unitId"
                    required
                    defaultValue={itemToEdit?.unitId || units[0]?.id || ""}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.symbol})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Lokasi Gudang */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Lokasi Penyimpanan
                  </label>
                  <select
                    name="locationId"
                    defaultValue={itemToEdit?.locationId || locations[0]?.id || ""}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">-- Pilih Lokasi --</option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Batas Stok Minimum */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Batas Stok Minimum *
                  </label>
                  <input
                    type="number"
                    name="minimumStock"
                    required
                    min="0"
                    defaultValue={itemToEdit?.minimumStock ?? 10}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Stok Awal (Hanya untuk input material baru) */}
              {!isEdit && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Stok Fisik Awal
                  </label>
                  <input
                    type="number"
                    name="currentStock"
                    min="0"
                    defaultValue={0}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Kuantitas saldo awal saat material pertama kali didaftarkan.
                  </p>
                </div>
              )}

              {/* Keterangan */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Keterangan / Catatan Spesifikasi
                </label>
                <textarea
                  name="description"
                  rows={2}
                  defaultValue={itemToEdit?.description || ""}
                  placeholder="Spesifikasi teknis, merek, atau catatan lapangan..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
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
                  className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-medium rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 transition-colors shadow-xs"
                >
                  {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isEdit ? "Simpan Perubahan" : "Simpan Material"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

