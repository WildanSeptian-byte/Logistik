import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// 0. Tabel Pengguna Sistem (Autentikasi & Hak Akses)
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  name: text("name").notNull(),
  password: text("password").notNull(), // Password terenkripsi bcrypt
  role: text("role").notNull().default("staf_logistik"), // 'staf_logistik' | 'site_manager'
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

// 1. Tabel Kategori Barang (misal: Material Pokok, Alat Kerja, Besi & Baja, APD)
export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
});

// 2. Tabel Satuan Barang (misal: Sak, Batang, Meter Kubik, Lembar, Kg, Pcs)
export const units = sqliteTable("units", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  symbol: text("symbol").notNull(), // Contoh: sak, btg, m3, lbr, kg, pcs
});

// 3. Tabel Lokasi Penyimpanan di Site Proyek (misal: Gudang Utama, Bedeng Besi, Site Timur)
export const locations = sqliteTable("locations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
});

// 4. Tabel Supplier / Vendor Material
export const suppliers = sqliteTable("suppliers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  contactPerson: text("contact_person"),
  phone: text("phone"),
  address: text("address"),
});

// 5. Tabel Master Barang (Material Konstruksi)
export const items = sqliteTable("items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").notNull().unique(), // Contoh: MAT-SMN-01
  name: text("name").notNull(), // Contoh: Semen Gresik 50kg
  categoryId: integer("category_id")
    .notNull()
    .references(() => categories.id),
  unitId: integer("unit_id")
    .notNull()
    .references(() => units.id),
  locationId: integer("location_id").references(() => locations.id),
  currentStock: integer("current_stock").notNull().default(0), // Cached saldo stok fisik
  minimumStock: integer("minimum_stock").notNull().default(10), // Ambang batas peringatan stok tipis
  description: text("description"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

// 6. Header Transaksi Barang Masuk (Material Tiba di Proyek)
export const incomingTransactions = sqliteTable("incoming_transactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  invoiceNumber: text("invoice_number").notNull().unique(), // No. Surat Jalan / No. DO
  supplierId: integer("supplier_id")
    .notNull()
    .references(() => suppliers.id),
  transactionDate: text("transaction_date").notNull(),
  recipientName: text("recipient_name").notNull(), // Petugas logistik penerima di lokasi
  notes: text("notes"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

// 7. Detail Barang Masuk (Item-item dalam satu Surat Jalan)
export const incomingItems = sqliteTable("incoming_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  transactionId: integer("transaction_id")
    .notNull()
    .references(() => incomingTransactions.id, { onDelete: "cascade" }),
  itemId: integer("item_id")
    .notNull()
    .references(() => items.id),
  quantity: integer("quantity").notNull(),
  notes: text("notes"),
});

// 8. Header Transaksi Barang Keluar (Pengambilan Material untuk Pekerjaan)
export const outgoingTransactions = sqliteTable("outgoing_transactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  referenceNumber: text("reference_number").notNull().unique(), // Nomor Bukti Pengeluaran Barang
  transactionDate: text("transaction_date").notNull(),
  recipientName: text("recipient_name").notNull(), // Nama Mandor / Subkon yang mengambil
  projectSection: text("project_section").notNull(), // Alokasi kerja: misal "Kolom Lt.2 Zona A"
  notes: text("notes"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

// 9. Detail Barang Keluar (Item-item yang dikeluarkan dalam satu SPB)
export const outgoingItems = sqliteTable("outgoing_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  transactionId: integer("transaction_id")
    .notNull()
    .references(() => outgoingTransactions.id, { onDelete: "cascade" }),
  itemId: integer("item_id")
    .notNull()
    .references(() => items.id),
  quantity: integer("quantity").notNull(),
  notes: text("notes"),
});

