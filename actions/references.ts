"use server";

import { db } from "@/db";
import { suppliers, categories, units, locations } from "@/db/schema";
import { revalidatePath } from "next/cache";

export type ActionResponse = {
  success: boolean;
  message: string;
};

// 1. Action Tambah Supplier
export async function createSupplier(formData: FormData): Promise<ActionResponse> {
  try {
    const name = (formData.get("name") as string)?.trim();
    const contactPerson = (formData.get("contactPerson") as string)?.trim() || null;
    const phone = (formData.get("phone") as string)?.trim() || null;
    const address = (formData.get("address") as string)?.trim() || null;

    if (!name) {
      return { success: false, message: "Nama supplier/vendor wajib diisi!" };
    }

    await db.insert(suppliers).values({
      name,
      contactPerson,
      phone,
      address,
    });

    revalidatePath("/suppliers");
    revalidatePath("/incoming");
    return { success: true, message: `Supplier "${name}" berhasil didaftarkan.` };
  } catch (error) {
    console.error("Error createSupplier:", error);
    return { success: false, message: "Gagal mendaftarkan supplier baru." };
  }
}

// 2. Action Tambah Kategori
export async function createCategory(formData: FormData): Promise<ActionResponse> {
  try {
    const name = (formData.get("name") as string)?.trim();
    const description = (formData.get("description") as string)?.trim() || null;

    if (!name) {
      return { success: false, message: "Nama kategori wajib diisi!" };
    }

    await db.insert(categories).values({ name, description });

    revalidatePath("/categories");
    revalidatePath("/items");
    return { success: true, message: `Kategori "${name}" berhasil ditambahkan.` };
  } catch (error) {
    console.error("Error createCategory:", error);
    return { success: false, message: "Gagal menambahkan kategori." };
  }
}

// 3. Action Tambah Satuan
export async function createUnit(formData: FormData): Promise<ActionResponse> {
  try {
    const name = (formData.get("name") as string)?.trim();
    const symbol = (formData.get("symbol") as string)?.trim();

    if (!name || !symbol) {
      return { success: false, message: "Nama satuan dan simbol wajib diisi!" };
    }

    await db.insert(units).values({ name, symbol });

    revalidatePath("/categories");
    revalidatePath("/items");
    return { success: true, message: `Satuan "${name} (${symbol})" berhasil ditambahkan.` };
  } catch (error) {
    console.error("Error createUnit:", error);
    return { success: false, message: "Gagal menambahkan satuan." };
  }
}

// 4. Action Tambah Lokasi Gudang
export async function createLocation(formData: FormData): Promise<ActionResponse> {
  try {
    const name = (formData.get("name") as string)?.trim();
    const description = (formData.get("description") as string)?.trim() || null;

    if (!name) {
      return { success: false, message: "Nama lokasi/area penyimpanan wajib diisi!" };
    }

    await db.insert(locations).values({ name, description });

    revalidatePath("/categories");
    revalidatePath("/items");
    return { success: true, message: `Lokasi "${name}" berhasil ditambahkan.` };
  } catch (error) {
    console.error("Error createLocation:", error);
    return { success: false, message: "Gagal menambahkan lokasi penyimpanan." };
  }
}

