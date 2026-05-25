import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="grid gap-6 border-b border-line pb-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="text-sm font-medium text-sage">Sistem Pendukung Keputusan</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-normal text-ink">
            Rekomendasi kandungan skincare berdasarkan jenis dan kondisi kulit
          </h1>
          <p className="mt-4 max-w-2xl leading-7 text-muted">
            Sistem ini memakai basis pengetahuan source-documented dan metode Fuzzy Mamdani untuk membantu memilih kandungan yang perlu dicari atau dihindari.
          </p>
          <Link href="/rekomendasi" className="mt-6 inline-flex items-center gap-2 rounded-md bg-sage px-4 py-2 text-sm font-semibold text-white">
            Mulai rekomendasi
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="rounded-md border border-line bg-white p-5 shadow-soft">
          <ShieldCheck className="h-7 w-7 text-sage" aria-hidden="true" />
          <h2 className="mt-4 text-lg font-semibold text-ink">Bukan toko online</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Sistem tidak menampilkan brand, produk, harga, rating, review, cart, atau tombol beli. Outputnya berupa kandungan, alasan, skor, risiko, dan routine edukatif.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["Input singkat", "Jenis kulit, kondisi, sensitivitas, tujuan, dan preferensi kehati-hatian."],
          ["Fuzzy Mamdani", "Input dipetakan ke skor 0-10, dievaluasi lewat rule, lalu didefuzzifikasi."],
          ["Keputusan pengguna", "Hasil bersifat informatif dan keputusan akhir tetap berada pada pengguna."]
        ].map(([title, body]) => (
          <article key={title} className="rounded-md border border-line bg-white p-5 shadow-soft">
            <h2 className="font-semibold text-ink">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{body}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
