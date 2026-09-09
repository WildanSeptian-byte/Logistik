"use server";

import { db } from "@/db";
import {
  items,
  incomingTransactions,
  incomingItems,
  outgoingTransactions,
  outgoingItems,
} from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type TransactionItemInput = {
  itemId: number;
  quantity: number;
  notes?: string;
};

export type ActionResponse = {
  success: boolean;
  message: string;
};

// ==========================================
// 1. TRANSAKSI BARANG MASUK (INCOMING)
// ==========================================
export async function createIncomingTransaction(data: {
  invoiceNumber: string;
  supplierId: number;
  transactionDate: string;
  recipientName: string;
  notes?: string;
  itemsList: TransactionItemInput[];
}): Promise<ActionResponse> {
  try {
    const {
      invoiceNumber,
      supplierId,
      transactionDate,
      recipientName,
      notes,
      itemsList,
    } = data;

    // Validasi Header
    if (!invoiceNumber?.trim() || !supplierId || !transactionDate || !recipientName?.trim()) {
      return {
        success: false,
        message: "Nomor Surat Jalan, Supplier, Tanggal, dan Nama Penerima wajib diisi!",
      };
    }

    if (!itemsList || itemsList.length === 0) {
      return {
        success: false,
        message: "Minimal harus ada 1 material yang dicatat!",
      };
    }

    // Validasi kuantitas item
    for (const row of itemsList) {
      if (!row.itemId || row.quantity <= 0) {
        return {
          success: false,
          message: "Kuantitas material masuk harus bernilai lebih dari 0!",
        };
      }
    }

    // Cek keunikan Nomor Surat Jalan
    const existing = await db
      .select()
      .from(incomingTransactions)
      .where(eq(incomingTransactions.invoiceNumber, invoiceNumber.trim()))
      .get();

    if (existing) {
      return {
        success: false,
        message: `Nomor Surat Jalan "${invoiceNumber}" sudah pernah dicatat sebelumnya!`,
      };
    }

    // Eksekusi Atomik Transaction (Header + Detail + Tambah Saldo Stok)
    await db.transaction(async (tx) => {
      // A. Simpan Header Transaksi Masuk
      const [insertedHeader] = await tx
        .insert(incomingTransactions)
        .values({
          invoiceNumber: invoiceNumber.trim(),
          supplierId,
          transactionDate,
          recipientName: recipientName.trim(),
          notes: notes?.trim() || null,
        })
        .returning();

      // B. Simpan Detail Item & Mutasi Stok Tambah
      for (const row of itemsList) {
        await tx.insert(incomingItems).values({
          transactionId: insertedHeader.id,
          itemId: row.itemId,
          quantity: row.quantity,
          notes: row.notes?.trim() || null,
        });

        // Mutasi Tambah Stok di tabel items
        await tx
          .update(items)
          .set({
            currentStock: sql`${items.currentStock} + ${row.quantity}`,
          })
          .where(eq(items.id, row.itemId));
      }
    });

    revalidatePath("/incoming");
    revalidatePath("/items");
    revalidatePath("/");

    return {
      success: true,
      message: `Penerimaan barang dengan No. Surat Jalan "${invoiceNumber}" berhasil disimpan dan stok otomatis bertambah.`,
    };
  } catch (error) {
    console.error("Error createIncomingTransaction:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat memproses transaksi barang masuk.",
    };
  }
}

// ==========================================
// 2. TRANSAKSI BARANG KELUAR (OUTGOING)
// DENGAN VALIDASI PENCEGAHAN STOK MINUS!
// ==========================================
export async function createOutgoingTransaction(data: {
  referenceNumber: string;
  transactionDate: string;
  recipientName: string;
  projectSection: string;
  notes?: string;
  itemsList: TransactionItemInput[];
}): Promise<ActionResponse> {
  try {
    const {
      referenceNumber,
      transactionDate,
      recipientName,
      projectSection,
      notes,
      itemsList,
    } = data;

    // Validasi Header
    if (
      !referenceNumber?.trim() ||
      !transactionDate ||
      !recipientName?.trim() ||
      !projectSection?.trim()
    ) {
      return {
        success: false,
        message:
          "Nomor Pengeluaran, Tanggal, Nama Pengambil, dan Bagian Pekerjaan wajib diisi!",
      };
    }

    if (!itemsList || itemsList.length === 0) {
      return {
        success: false,
        message: "Minimal harus ada 1 material yang dikeluarkan!",
      };
    }

    // Cek keunikan Nomor Pengeluaran
    const existing = await db
      .select()
      .from(outgoingTransactions)
      .where(eq(outgoingTransactions.referenceNumber, referenceNumber.trim()))
      .get();

    if (existing) {
      return {
        success: false,
        message: `Nomor SPB "${referenceNumber}" sudah pernah digunakan!`,
      };
    }

    // VALIDASI KRUSIAL: CEK KETERSEDIAAN STOK (ANTI-STOK MINUS)
    for (const row of itemsList) {
      if (!row.itemId || row.quantity <= 0) {
        return {
          success: false,
          message: "Kuantitas material keluar harus lebih dari 0!",
        };
      }

      const itemRecord = await db
        .select()
        .from(items)
        .where(eq(items.id, row.itemId))
        .get();

      if (!itemRecord) {
        return {
          success: false,
          message: `Material dengan ID ${row.itemId} tidak ditemukan!`,
        };
      }

      if (itemRecord.currentStock < row.quantity) {
        return {
          success: false,
          message: `Stok tidak mencukupi untuk "${itemRecord.name}"! Stok fisik saat ini: ${itemRecord.currentStock}, permintaan: ${row.quantity}. Transaksi otomatis dibatalkan.`,
        };
      }
    }

    // Eksekusi Atomik Transaction (Header + Detail + Kurang Saldo Stok)
    await db.transaction(async (tx) => {
      // A. Simpan Header Transaksi Keluar
      const [insertedHeader] = await tx
        .insert(outgoingTransactions)
        .values({
          referenceNumber: referenceNumber.trim(),
          transactionDate,
          recipientName: recipientName.trim(),
          projectSection: projectSection.trim(),
          notes: notes?.trim() || null,
        })
        .returning();

      // B. Simpan Detail Item & Mutasi Stok Kurang
      for (const row of itemsList) {
        await tx.insert(outgoingItems).values({
          transactionId: insertedHeader.id,
          itemId: row.itemId,
          quantity: row.quantity,
          notes: row.notes?.trim() || null,
        });

        // Mutasi Kurangi Stok di tabel items
        await tx
          .update(items)
          .set({
            currentStock: sql`${items.currentStock} - ${row.quantity}`,
          })
          .where(eq(items.id, row.itemId));
      }
    });

    revalidatePath("/outgoing");
    revalidatePath("/items");
    revalidatePath("/");

    return {
      success: true,
      message: `Pengeluaran barang dengan No. SPB "${referenceNumber}" berhasil dicatat dan stok otomatis berkurang.`,
    };
  } catch (error) {
    console.error("Error createOutgoingTransaction:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat memproses transaksi barang keluar.",
    };
  }
}

