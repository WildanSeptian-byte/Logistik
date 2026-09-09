"use server";

import { db } from "@/db";
import { items, incomingItems, outgoingItems } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type ActionResponse = {
  success: boolean;
  message: string;
};

// 1. Action Menambah Material Baru
export async function createItem(formData: FormData): Promise<ActionResponse> {
  try {
    const code = (formData.get("code") as string)?.trim();
    const name = (formData.get("name") as string)?.trim();
    const categoryId = Number(formData.get("categoryId"));
    const unitId = Number(formData.get("unitId"));
    const locationId = formData.get("locationId")
      ? Number(formData.get("locationId"))
      : null;
    const currentStock = Number(formData.get("currentStock")) || 0;
    const minimumStock = Number(formData.get("minimumStock")) || 0;
    const description = (formData.get("description") as string)?.trim() || null;

    if (!code || !name || !categoryId || !unitId) {
      return {
        success: false,
        message: "Kode, nama material, kategori, dan satuan wajib diisi!",
      };
    }

    // Cek duplikasi kode barang
    const existing = await db
      .select()
      .from(items)
      .where(eq(items.code, code))
      .get();

    if (existing) {
      return {
        success: false,
        message: `Kode material "${code}" sudah digunakan oleh barang lain!`,
      };
    }

    await db.insert(items).values({
      code,
      name,
      categoryId,
      unitId,
      locationId,
      currentStock,
      minimumStock,
      description,
    });

    revalidatePath("/items");
    revalidatePath("/");

    return {
      success: true,
      message: `Material "${name}" berhasil ditambahkan ke inventaris.`,
    };
  } catch (error) {
    console.error("Error createItem:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat menyimpan material baru.",
    };
  }
}

// 2. Action Mengubah Data Material
export async function updateItem(
  id: number,
  formData: FormData
): Promise<ActionResponse> {
  try {
    const code = (formData.get("code") as string)?.trim();
    const name = (formData.get("name") as string)?.trim();
    const categoryId = Number(formData.get("categoryId"));
    const unitId = Number(formData.get("unitId"));
    const locationId = formData.get("locationId")
      ? Number(formData.get("locationId"))
      : null;
    const minimumStock = Number(formData.get("minimumStock")) || 0;
    const description = (formData.get("description") as string)?.trim() || null;

    if (!code || !name || !categoryId || !unitId) {
      return {
        success: false,
        message: "Kode, nama material, kategori, dan satuan wajib diisi!",
      };
    }

    // Cek duplikasi kode pada ID berbeda
    const existing = await db
      .select()
      .from(items)
      .where(eq(items.code, code))
      .get();

    if (existing && existing.id !== id) {
      return {
        success: false,
        message: `Kode material "${code}" sudah digunakan oleh barang lain!`,
      };
    }

    await db
      .update(items)
      .set({
        code,
        name,
        categoryId,
        unitId,
        locationId,
        minimumStock,
        description,
      })
      .where(eq(items.id, id));

    revalidatePath("/items");
    revalidatePath("/");

    return {
      success: true,
      message: `Material "${name}" berhasil diperbarui.`,
    };
  } catch (error) {
    console.error("Error updateItem:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat memperbarui material.",
    };
  }
}

// 3. Action Menghapus Material (Dengan Proteksi Riwayat Transaksi)
export async function deleteItem(id: number): Promise<ActionResponse> {
  try {
    // Periksa apakah material pernah tercatat di transaksi masuk
    const hasIncoming = await db
      .select()
      .from(incomingItems)
      .where(eq(incomingItems.itemId, id))
      .get();

    if (hasIncoming) {
      return {
        success: false,
        message:
          "Material ini tidak boleh dihapus karena sudah memiliki riwayat transaksi barang masuk!",
      };
    }

    // Periksa apakah material pernah tercatat di transaksi keluar
    const hasOutgoing = await db
      .select()
      .from(outgoingItems)
      .where(eq(outgoingItems.itemId, id))
      .get();

    if (hasOutgoing) {
      return {
        success: false,
        message:
          "Material ini tidak boleh dihapus karena sudah memiliki riwayat transaksi barang keluar!",
      };
    }

    // Hapus jika bersih dari transaksi
    await db.delete(items).where(eq(items.id, id));

    revalidatePath("/items");
    revalidatePath("/");

    return {
      success: true,
      message: "Material berhasil dihapus dari sistem.",
    };
  } catch (error) {
    console.error("Error deleteItem:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat menghapus material.",
    };
  }
}

