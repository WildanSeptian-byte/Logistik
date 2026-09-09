import { db } from "@/db";
import { items, categories, units, locations } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { ItemTable } from "@/components/items/item-table";
import { ItemDialog } from "@/components/items/item-dialog";

export const dynamic = "force-dynamic";

export default async function ItemsPage() {
  // 1. Ambil data master dari Turso DB
  const rawItems = await db
    .select({
      id: items.id,
      code: items.code,
      name: items.name,
      categoryId: items.categoryId,
      categoryName: categories.name,
      unitId: items.unitId,
      unitSymbol: units.symbol,
      locationId: items.locationId,
      locationName: locations.name,
      currentStock: items.currentStock,
      minimumStock: items.minimumStock,
      description: items.description,
    })
    .from(items)
    .leftJoin(categories, eq(items.categoryId, categories.id))
    .leftJoin(units, eq(items.unitId, units.id))
    .leftJoin(locations, eq(items.locationId, locations.id))
    .orderBy(desc(items.id));

  const allCategories = await db.select().from(categories);
  const allUnits = await db.select().from(units);
  const allLocations = await db.select().from(locations);

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Master Data Material & Barang
          </h1>
          <p className="text-sm text-slate-500">
            Katalog spesifikasi material, lokasi penyimpanan, dan batas minimum stok proyek.
          </p>
        </div>

        {/* Tombol Tambah Material (Modal Dialog) */}
        <ItemDialog
          mode="create"
          categories={allCategories}
          units={allUnits}
          locations={allLocations}
        />
      </div>

      {/* Tabel Material Interaktif */}
      <ItemTable
        initialItems={rawItems}
        categories={allCategories}
        units={allUnits}
        locations={allLocations}
      />
    </div>
  );
}

