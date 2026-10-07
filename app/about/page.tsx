import { Metadata } from "next";
import { Info, Code2, Database, LayoutTemplate, ShieldCheck, Cpu, MonitorSmartphone } from "lucide-react";

export const metadata: Metadata = {
  title: "Tentang Sistem | Sistem Logistik",
  description: "Informasi teknologi dan framework yang digunakan dalam pengembangan sistem logistik.",
};

const techStack = [
  {
    category: "Bahasa Pemrograman",
    tech: "TypeScript, JavaScript (ES6), HTML5, CSS3",
    fungsi: "Pengembangan logika back-end, interaksi di sisi klien, dan antarmuka halaman web.",
  },
  {
    category: "Framework Web",
    tech: "Next.js (App Router), React, Tailwind CSS",
    fungsi: "Mempercepat pembangunan struktur aplikasi dengan SSR/RSC dan membuat tampilan web yang responsif.",
  },
  {
    category: "Database & ORM",
    tech: "Turso (libSQL / SQLite), Drizzle ORM",
    fungsi: "Menyimpan data riwayat mutasi stok, master barang, referensi kategori, dan data pengguna.",
  },
  {
    category: "Library Pendukung",
    tech: "Lucide React, bcryptjs, jose (JWT)",
    fungsi: "Menyediakan aset ikon visual, mengenkripsi kata sandi, dan mengelola keamanan sesi (autentikasi).",
  },
  {
    category: "Tools Pengembangan",
    tech: "Visual Studio Code, Git, Node.js",
    fungsi: "Penulisan kode sumber, local web server, version control, dan pengelolaan dependensi.",
  },
  {
    category: "Perangkat & Platform",
    tech: "PC/Laptop (Windows), Web Browser, Vercel",
    fungsi: "Platform operasional untuk menjalankan sistem dan lingkungan cloud deployment aplikasi.",
  }
];

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Info className="w-6 h-6 text-amber-600" />
            Tentang Sistem
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Informasi mengenai stack teknologi dan tools yang digunakan pada aplikasi logistik ini.
          </p>
        </div>
      </div>

      <div className="bg-[#1a1a1a] rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-[#242424] border-b border-slate-700/50 text-slate-200 text-[13px] font-semibold">
              <tr>
                <th className="px-6 py-4 w-1/4">Kategori</th>
                <th className="px-6 py-4 w-1/3">Teknologi / Tools yang Digunakan</th>
                <th className="px-6 py-4">Fungsi dalam Proyek</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {techStack.map((item, index) => (
                <tr key={index} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-bold text-white align-top">
                    {item.category}
                  </td>
                  <td className="px-6 py-4 align-top">
                    {item.tech}
                  </td>
                  <td className="px-6 py-4 align-top leading-relaxed">
                    {item.fungsi}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
