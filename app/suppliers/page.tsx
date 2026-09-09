import { db } from "@/db";
import { suppliers } from "@/db/schema";
import { desc } from "drizzle-orm";
import { SupplierView } from "@/components/references/supplier-view";

export const dynamic = "force-dynamic";

export default async function SuppliersPage() {
  const allSuppliers = await db
    .select()
    .from(suppliers)
    .orderBy(desc(suppliers.id));

  return <SupplierView suppliers={allSuppliers} />;
}

