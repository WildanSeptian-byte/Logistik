"use client";

import React, { useState, useTransition } from "react";
import { Plus, X, Layers, Scale, MapPin, Loader2 } from "lucide-react";
import { createCategory, createUnit, createLocation } from "@/actions/references";

interface CategoryViewProps {
  categories: { id: number; name: string; description: string | null }[];
  units: { id: number; name: string; symbol: string }[];
  locations: { id: number; name: string; description: string | null }[];
}

export function CategoryView({ categories, units, locations }: CategoryViewProps) {
  const [activeTab, setActiveTab] = useState<"cat" | "unit" | "loc">("cat");
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // States modal
  const [openModal, setOpenModal] = useState<"cat" | "unit" | "loc" | null>(null);

  const handleAddCategory = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const res = await createCategory(formData);
      if (res.success) {
        setOpenModal(null);
        form.reset();
      } else {
        setErrorMessage(res.message);
      }
    });
  };

  const handleAddUnit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const res = await createUnit(formData);
      if (res.success) {
        setOpenModal(null);
        form.reset();
      } else {
        setErrorMessage(res.message);
      }
    });
  };

  const handleAddLocation = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const res = await createLocation(formData);
      if (res.success) {
        setOpenModal(null);
        form.reset();
      } else {
        setErrorMessage(res.message);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Data Referensi Standar Proyek
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Pengelompokan kategori material, satuan pengukuran fisik, dan titik lokasi penyimpanan di site.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setOpenModal(activeTab)}
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>
            {activeTab === "cat"
              ? "Tambah Kategori"
              : activeTab === "unit"
              ? "Tambah Satuan"
              : "Tambah Lokasi"}
          </span>
        </button>
      </div>

      {/* Tab Navigasi */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          type="button"
          onClick={() => setActiveTab("cat")}
          className={`flex items-center space-x-2 pb-3 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === "cat"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Kategori Material ({categories.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("unit")}
          className={`flex items-center space-x-2 pb-3 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === "unit"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Satuan Pengukuran ({units.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("loc")}
          className={`flex items-center space-x-2 pb-3 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === "loc"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Lokasi Gudang Proyek ({locations.length})</span>
        </button>
      </div>

      {/* Konten Tab 1: Kategori */}
      {activeTab === "cat" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((c) => (
            <div
              key={c.id}
              className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs hover:border-slate-300 transition-colors"
            >
              <h3 className="font-semibold text-slate-900 text-sm">{c.name}</h3>
              <p className="text-xs text-slate-500 mt-1">
                {c.description || "Tidak ada keterangan tambahan."}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Konten Tab 2: Satuan */}
      {activeTab === "unit" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {units.map((u) => (
            <div
              key={u.id}
              className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs hover:border-slate-300 transition-colors flex items-center justify-between"
            >
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">{u.name}</h3>
                <span className="text-[11px] font-mono text-slate-400">Simbol</span>
              </div>
              <span className="font-mono text-xs font-bold px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg">
                {u.symbol}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Konten Tab 3: Lokasi Gudang */}
      {activeTab === "loc" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {locations.map((loc) => (
            <div
              key={loc.id}
              className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs hover:border-slate-300 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-indigo-600" />
                <h3 className="font-semibold text-slate-900 text-sm">{loc.name}</h3>
              </div>
              <p className="text-xs text-slate-500 mt-1.5 pl-6">
                {loc.description || "Area penempatan material proyek."}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Modal Tambah Kategori */}
      {openModal === "cat" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-6">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="font-semibold text-slate-900 text-sm">Tambah Kategori Material</h3>
              <button onClick={() => setOpenModal(null)}><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleAddCategory} className="space-y-4">
              {errorMessage && <div className="text-xs text-rose-600 bg-rose-50 p-2 rounded">{errorMessage}</div>}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Nama Kategori *</label>
                <input type="text" name="name" required placeholder="Contoh: Instalasi Listrik & Pipa" className="w-full px-3 py-2 text-xs border rounded-lg" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Keterangan</label>
                <textarea name="description" rows={2} placeholder="Keterangan singkat..." className="w-full px-3 py-2 text-xs border rounded-lg" />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setOpenModal(null)} className="px-3 py-1.5 text-xs text-slate-600">Batal</button>
                <button type="submit" disabled={isPending} className="px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-lg">
                  {isPending ? "Menyimpan..." : "Simpan Kategori"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Satuan */}
      {openModal === "unit" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-6">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="font-semibold text-slate-900 text-sm">Tambah Satuan Pengukuran</h3>
              <button onClick={() => setOpenModal(null)}><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleAddUnit} className="space-y-4">
              {errorMessage && <div className="text-xs text-rose-600 bg-rose-50 p-2 rounded">{errorMessage}</div>}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Nama Satuan Lengkap *</label>
                <input type="text" name="name" required placeholder="Contoh: Kiloliter / Drum" className="w-full px-3 py-2 text-xs border rounded-lg" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Simbol Singkatan *</label>
                <input type="text" name="symbol" required placeholder="Contoh: kl, drm, btg" className="w-full px-3 py-2 text-xs border rounded-lg" />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setOpenModal(null)} className="px-3 py-1.5 text-xs text-slate-600">Batal</button>
                <button type="submit" disabled={isPending} className="px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-lg">
                  {isPending ? "Menyimpan..." : "Simpan Satuan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Lokasi */}
      {openModal === "loc" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-6">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="font-semibold text-slate-900 text-sm">Tambah Lokasi Penyimpanan</h3>
              <button onClick={() => setOpenModal(null)}><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleAddLocation} className="space-y-4">
              {errorMessage && <div className="text-xs text-rose-600 bg-rose-50 p-2 rounded">{errorMessage}</div>}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Nama Area / Gudang *</label>
                <input type="text" name="name" required placeholder="Contoh: Gudang B3 (Cat & Thinner)" className="w-full px-3 py-2 text-xs border rounded-lg" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Keterangan / Lokasi Site</label>
                <textarea name="description" rows={2} placeholder="Dekat gerbang barat / lantai basement..." className="w-full px-3 py-2 text-xs border rounded-lg" />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setOpenModal(null)} className="px-3 py-1.5 text-xs text-slate-600">Batal</button>
                <button type="submit" disabled={isPending} className="px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-lg">
                  {isPending ? "Menyimpan..." : "Simpan Lokasi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

