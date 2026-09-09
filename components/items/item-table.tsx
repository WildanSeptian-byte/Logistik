"use client";

import React, { useState, useTransition } from "react";
import { Search, Filter, Trash2, AlertCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ItemDialog } from "./item-dialog";
import { deleteItem } from "@/actions/items";
import { formatNumber } from "@/lib/utils";

interface ItemRecord {
  id: number;
  code: string;
  name: string;
  categoryId: number;
  categoryName: string | null;
  unitId: number;
  unitSymbol: string | null;
  locationId: number | null;
  locationName: string | null;
  currentStock: number;
  minimumStock: number;
  description: string | null;
}

interface ItemTableProps {
  initialItems: ItemRecord[];
  categories: { id: number; name: string }[];
  units: { id: number; name: string; symbol: string }[];
  locations: { id: number; name: string }[];
}

export function ItemTable({
  initialItems,
  categories,
  units,
  locations,
}: ItemTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [itemToDelete, setItemToDelete] = useState<ItemRecord | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();

  // Filter logika
  const filteredItems = initialItems.filter((item) => {
    const matchQuery =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase());

    const matchCategory =
      selectedCategory === "ALL" ||
      item.categoryId === Number(selectedCategory);

    const isLowStock = item.currentStock <= item.minimumStock;
    const matchStatus =
      selectedStatus === "ALL" ||
      (selectedStatus === "LOW" && isLowStock) ||
      (selectedStatus === "SAFE" && !isLowStock);

    return matchQuery && matchCategory && matchStatus;
  });

  const handleDelete = () => {
    if (!itemToDelete) return;
    setDeleteError(null);

    startDeleteTransition(async () => {
      const res = await deleteItem(itemToDelete.id);
      if (res.success) {
        setItemToDelete(null);
      } else {
        setDeleteError(res.message);
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Bar Filter & Pencarian */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Input Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kode atau nama material..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder:text-slate-400"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-2">
          <div className="flex items-center space-x-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Filter:</span>
          </div>

          {/* Kategori */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="ALL">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Status Stok */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="ALL">Semua Status</option>
            <option value="SAFE">Stok Aman</option>
            <option value="LOW">Stok Kritis</option>
          </select>
        </div>
      </div>

      {/* Tabel Material */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">Kode</th>
                <th className="px-5 py-3">Nama Material</th>
                <th className="px-5 py-3">Kategori</th>
                <th className="px-5 py-3">Lokasi Gudang</th>
                <th className="px-5 py-3 text-right">Stok Fisik</th>
                <th className="px-5 py-3 text-right">Batas Min</th>
                <th className="px-5 py-3 text-center">Status</th>
                <th className="px-5 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-slate-400 text-sm"
                  >
                    Tidak ada material yang sesuai dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isLow = item.currentStock <= item.minimumStock;
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="px-5 py-3.5 font-mono text-xs font-semibold text-slate-700">
                        {item.code}
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-slate-900">{item.name}</p>
                        {item.description && (
                          <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                            {item.description}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-600">
                        {item.categoryName || "-"}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-500">
                        {item.locationName || "-"}
                      </td>
                      <td className="px-5 py-3.5 text-right font-bold text-slate-900">
                        {formatNumber(item.currentStock)}{" "}
                        <span className="text-xs font-normal text-slate-500">
                          {item.unitSymbol}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right text-xs text-slate-500">
                        {formatNumber(item.minimumStock)} {item.unitSymbol}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        {isLow ? (
                          <Badge variant="danger">Kritis</Badge>
                        ) : (
                          <Badge variant="success">Aman</Badge>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          {/* Dialog Edit */}
                          <ItemDialog
                            mode="edit"
                            itemToEdit={{
                              id: item.id,
                              code: item.code,
                              name: item.name,
                              categoryId: item.categoryId,
                              unitId: item.unitId,
                              locationId: item.locationId,
                              currentStock: item.currentStock,
                              minimumStock: item.minimumStock,
                              description: item.description,
                            }}
                            categories={categories}
                            units={units}
                            locations={locations}
                          />

                          {/* Tombol Hapus */}
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteError(null);
                              setItemToDelete(item);
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Hapus Material"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Konfirmasi Hapus */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-slate-900">
                  Konfirmasi Hapus Material
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Apakah Anda yakin ingin menghapus material{" "}
                  <span className="font-semibold text-slate-800">
                    &quot;{itemToDelete.name}&quot; ({itemToDelete.code})
                  </span>
                  ? Tindakan ini tidak dapat dibatalkan.
                </p>

                {deleteError && (
                  <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
                    {deleteError}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-medium rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition-colors shadow-xs"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Hapus Material</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

