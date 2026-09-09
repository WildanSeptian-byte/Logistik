import { db } from "@/db";
import { categories, units, locations } from "@/db/schema";
import { CategoryView } from "@/components/references/category-view";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const allCategories = await db.select().from(categories);
  const allUnits = await db.select().from(units);
  const allLocations = await db.select().from(locations);

  return (
    <CategoryView
      categories={allCategories}
      units={allUnits}
      locations={allLocations}
    />
  );
}

