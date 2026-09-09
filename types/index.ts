// Definisi tipe data inti untuk inventaris logistik proyek

export interface Category {
  id: number;
  name: string;
  description?: string | null;
}

export interface Unit {
  id: number;
  name: string;      // Contoh: "Batang", "Sak", "Meter Kubik"
  symbol: string;    // Contoh: "btg", "sak", "m³"
}

export interface Location {
  id: number;
  name: string;      // Contoh: "Gudang Utama", "Site Barat", "Bedeng Besi"
  description?: string | null;
}

export interface Supplier {
  id: number;
  name: string;
  contactPerson?: string | null;
  phone?: string | null;
  address?: string | null;
}

export interface Item {
  id: number;
  code: string;           // Contoh: "MAT-BESI-01"
  name: string;           // Contoh: "Besi Beton Ulir 13mm"
  categoryId: number;
  unitId: number;
  locationId?: number | null;
  currentStock: number;
  minimumStock: number;
  description?: string | null;
  createdAt: string;
}

export type TransactionType = "IN" | "OUT";

export interface StockMovement {
  id: number;
  transactionType: TransactionType;
  referenceNumber: string; // Nomor Surat Jalan atau Bukti Pengeluaran
  date: string;
  recipientOrSource: string; // Nama Supplier (jika masuk) atau Mandor/Area (jika keluar)
  totalItems: number;
  notes?: string | null;
}

