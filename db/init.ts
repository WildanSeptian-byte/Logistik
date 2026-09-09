import { db } from "./index";
import { sql } from "drizzle-orm";
import { categories, units, locations, suppliers, items } from "./schema";

let isInitialized = false;

export async function ensureDatabaseInitialized() {
  if (isInitialized) return;

  try {
    // 1. Buat seluruh tabel jika belum ada di database Turso
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT
      );
    `);

    await db.run(sql`
      CREATE TABLE IF NOT EXISTS units (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        symbol TEXT NOT NULL
      );
    `);

    await db.run(sql`
      CREATE TABLE IF NOT EXISTS locations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT
      );
    `);

    await db.run(sql`
      CREATE TABLE IF NOT EXISTS suppliers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        contact_person TEXT,
        phone TEXT,
        address TEXT
      );
    `);

    await db.run(sql`
      CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        category_id INTEGER NOT NULL REFERENCES categories(id),
        unit_id INTEGER NOT NULL REFERENCES units(id),
        location_id INTEGER REFERENCES locations(id),
        current_stock INTEGER NOT NULL DEFAULT 0,
        minimum_stock INTEGER NOT NULL DEFAULT 10,
        description TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.run(sql`
      CREATE TABLE IF NOT EXISTS incoming_transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_number TEXT NOT NULL UNIQUE,
        supplier_id INTEGER NOT NULL REFERENCES suppliers(id),
        transaction_date TEXT NOT NULL,
        recipient_name TEXT NOT NULL,
        notes TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.run(sql`
      CREATE TABLE IF NOT EXISTS incoming_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        transaction_id INTEGER NOT NULL REFERENCES incoming_transactions(id) ON DELETE CASCADE,
        item_id INTEGER NOT NULL REFERENCES items(id),
        quantity INTEGER NOT NULL,
        notes TEXT
      );
    `);

    await db.run(sql`
      CREATE TABLE IF NOT EXISTS outgoing_transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reference_number TEXT NOT NULL UNIQUE,
        transaction_date TEXT NOT NULL,
        recipient_name TEXT NOT NULL,
        project_section TEXT NOT NULL,
        notes TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.run(sql`
      CREATE TABLE IF NOT EXISTS outgoing_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        transaction_id INTEGER NOT NULL REFERENCES outgoing_transactions(id) ON DELETE CASCADE,
        item_id INTEGER NOT NULL REFERENCES items(id),
        quantity INTEGER NOT NULL,
        notes TEXT
      );
    `);

    // 2. Cek apakah kategori sudah ada data awal; jika belum, isi data seed otomatis
    const existingCat = await db.select().from(categories).limit(1);
    if (existingCat.length === 0) {
      console.log("🌱 Database kosong terdeteksi, mengisi data master konstruksi awal...");

      const insertedCategories = await db
        .insert(categories)
        .values([
          { name: "Material Pokok", description: "Semen, pasir, batu split, bata ringan" },
          { name: "Besi & Baja", description: "Besi beton ulir, wiremesh, baja ringan" },
          { name: "Bahan Finishing", description: "Cat dinding, keramik, semen instan/mortar" },
          { name: "Alat & Perlengkapan", description: "Cangkul, gerobak dorong, kawat bendrat, paku" },
          { name: "K3 & APD", description: "Helm proyek, rompi scotlight, sarung tangan, sepatu boots" },
        ])
        .returning();

      const insertedUnits = await db
        .insert(units)
        .values([
          { name: "Sak", symbol: "sak" },
          { name: "Batang / Lonjor", symbol: "btg" },
          { name: "Meter Kubik", symbol: "m³" },
          { name: "Kilogram", symbol: "kg" },
          { name: "Lembar", symbol: "lbr" },
          { name: "Dus / Box", symbol: "dus" },
          { name: "Pcs / Buah", symbol: "pcs" },
          { name: "Roll / Gulung", symbol: "roll" },
        ])
        .returning();

      const insertedLocations = await db
        .insert(locations)
        .values([
          { name: "Gudang Utama Material", description: "Gudang tertutup untuk semen dan finishing" },
          { name: "Area Terbuka / Stockyard", description: "Area terbuka untuk pasir, batu split, bata" },
          { name: "Bedeng Fabrikasi Besi", description: "Area pembengkokan & perakitan besi beton" },
          { name: "Gudang Alat & K3", description: "Ruang penyimpanan alat kerja dan safety" },
        ])
        .returning();

      const insertedSuppliers = await db
        .insert(suppliers)
        .values([
          {
            name: "PT Semen Nusantara Mandiri",
            contactPerson: "Bpk. Hendra",
            phone: "081234567890",
            address: "Jl. Raya Industri No. 45, Kawasan Pergudangan",
          },
          {
            name: "CV Baja Perkasa Konstruksi",
            contactPerson: "Ibu Maya",
            phone: "081398765432",
            address: "Jl. Logistik Logam No. 12",
          },
          {
            name: "TB Cahaya Bangunan",
            contactPerson: "Ko Acong",
            phone: "081122334455",
            address: "Jl. Proyek Makmur No. 88",
          },
        ])
        .returning();

      await db.insert(items).values([
        {
          code: "MAT-SMN-01",
          name: "Semen Portland Tiga Roda 50kg",
          categoryId: insertedCategories[0].id,
          unitId: insertedUnits[0].id,
          locationId: insertedLocations[0].id,
          currentStock: 120,
          minimumStock: 30,
          description: "Semen untuk struktur dan pengecoran kolom",
        },
        {
          code: "MAT-BESI-01",
          name: "Besi Beton Ulir D13 mm (12m)",
          categoryId: insertedCategories[1].id,
          unitId: insertedUnits[1].id,
          locationId: insertedLocations[2].id,
          currentStock: 250,
          minimumStock: 50,
          description: "Besi tulangan utama balok dan kolom",
        },
        {
          code: "MAT-BESI-02",
          name: "Kawat Bendrat Hitam",
          categoryId: insertedCategories[3].id,
          unitId: insertedUnits[7].id,
          locationId: insertedLocations[2].id,
          currentStock: 8,
          minimumStock: 10,
          description: "Pengikat tulangan pembesian",
        },
        {
          code: "MAT-SFT-01",
          name: "Helm Proyek Standar SNI (Putih)",
          categoryId: insertedCategories[4].id,
          unitId: insertedUnits[6].id,
          locationId: insertedLocations[3].id,
          currentStock: 25,
          minimumStock: 5,
          description: "APD wajib untuk staf lapangan & tamu proyek",
        },
      ]);
    }

    isInitialized = true;
  } catch (error) {
    console.error("Error ensureDatabaseInitialized:", error);
    throw error;
  }
}
