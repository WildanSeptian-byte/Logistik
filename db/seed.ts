import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { db } from "./index";
import { categories, units, locations, suppliers, items } from "./schema";

async function main() {
  console.log("🌱 Memulai seeding data master awal proyek konstruksi...");

  // 1. Seed Kategori Material
  console.log("-> Mengisi kategori material...");
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

  // 2. Seed Satuan Material
  console.log("-> Mengisi satuan material...");
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

  // 3. Seed Lokasi Gudang Proyek
  console.log("-> Mengisi lokasi gudang proyek...");
  const insertedLocations = await db
    .insert(locations)
    .values([
      { name: "Gudang Utama Material", description: "Gudang tertutup untuk semen dan finishing" },
      { name: "Area Terbuka / Stockyard", description: "Area terbuka untuk pasir, batu split, bata" },
      { name: "Bedeng Fabrikasi Besi", description: "Area pembengkokan & perakitan besi beton" },
      { name: "Gudang Alat & K3", description: "Ruang penyimpanan alat kerja dan safety" },
    ])
    .returning();

  // 4. Seed Supplier Vendor
  console.log("-> Mengisi master supplier...");
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

  // 5. Seed Beberapa Material Contoh Proyek
  console.log("-> Mengisi master material konstruksi awal...");
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
      minimumStock: 10, // Kritis (stok di bawah minimum!)
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

  console.log("✅ Seeding database berhasil selesai!");
}

main().catch((err) => {
  console.error("❌ Gagal melakukan seeding:", err);
  process.exit(1);
});

